require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { exec, execFile } = require("child_process");
const db = require("./config/db");
const teamStore = require("./contentStore");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
});

const app = express();
app.use(cors());
const fs = require("fs");
const path = require("path");
const uploadsDir = path.join(__dirname, "uploads", "profiles");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(path.join(__dirname, "uploads"), { maxAge: "1h" }));
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// ── Admin Authentication Middleware ──
const adminAuth = (req, res, next) => {
  const adminKey = req.headers["x-admin-key"];
  const expectedKey = process.env.ADMIN_API_KEY;

  if (!expectedKey || !adminKey) {
    return res.status(401).json({ error: "Unauthorized: Admin authorization required" });
  }

  const adminKeyBuf = Buffer.from(String(adminKey));
  const expectedKeyBuf = Buffer.from(String(expectedKey));

  if (adminKeyBuf.length !== expectedKeyBuf.length || !crypto.timingSafeEqual(adminKeyBuf, expectedKeyBuf)) {
    return res.status(401).json({ error: "Unauthorized: Admin authorization required" });
  }
  next();
};

// ── System Audit Logging Helper ──
const logSystemActivity = async ({ actionType, adminUser = "Admin", details = "", targetId = null, targetCategory = null, status = "SUCCESS", req = null }) => {
  try {
    const ip = req ? (req.headers["x-forwarded-for"] || req.socket?.remoteAddress || req.ip || "127.0.0.1") : "127.0.0.1";
    await db.query(
      "INSERT INTO system_logs (action_type, admin_user, details, target_id, target_category, status, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [actionType, adminUser, details, targetId, targetCategory, status, String(ip)]
    );
  } catch (logErr) {
    console.error("Failed to write to system_logs:", logErr.message);
  }
};

// Ensure soft-delete columns exist on pc_parts
async function initSoftDeleteSchema() {
  try {
    const [cols] = await db.query("DESCRIBE pc_parts");
    const colNames = cols.map(c => c.Field);
    if (!colNames.includes("is_archived")) {
      await db.query("ALTER TABLE pc_parts ADD COLUMN is_archived TINYINT(1) DEFAULT 0");
    }
    if (!colNames.includes("deleted_at")) {
      await db.query("ALTER TABLE pc_parts ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL");
    }
  } catch (err) {
    console.error("Soft-delete schema init error:", err.message);
  }
}
initSoftDeleteSchema();

const mailer = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    })
  : null;

const generatePin = () => String(crypto.randomInt(0, 1000000)).padStart(6, "0");

const hashPin = (pin) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(pin, salt, 32).toString("hex");
  return `${salt}:${hash}`;
};

const verifyPin = (pin, stored) => {
  try {
    const [salt, expected] = String(stored).split(":");
    const actual = crypto.scryptSync(pin, salt, 32);
    const expectedBuf = Buffer.from(expected, "hex");
    return actual.length === expectedBuf.length && crypto.timingSafeEqual(actual, expectedBuf);
  } catch {
    return false;
  }
};

async function mailPin(email, name, pin) {
  if (!mailer) {
    console.log(`[BuildLab PIN] Development fallback for ${email}: ${pin}`);
    return false;
  }
  try {
    await mailer.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER || '"BuildLab Security" <noreply@buildlab.ph>',
      to: email,
      subject: "Your BuildLab reset code",
      text: `Hi ${name},\n\nHere is your reset code for BuildLab: ${pin}\n\nKeep this code. You can use it any time in Settings to reset your learning progress.\n\nIf you did not request this, ignore this message.\n\nBuildLab`,
    });
    return true;
  } catch (err) {
    console.error("PIN email error:", err.message);
    return false;
  }
}

// Seed essential compatible parts so manual assembly always supports AM4, AM5, LGA1700, DDR4, DDR5 & 850W PSU
async function seedEssentialCompatibleParts() {
  try {
    await db.query("UPDATE pc_parts SET form_factor = 'Mid Tower' WHERE category = 'case' AND (form_factor IS NULL OR form_factor = '')");

    const essentialParts = [
      {
        id: "case1",
        category: "case",
        name: "Montech AIR-903-base",
        brand: "Montech",
        desc: "Excellent airflow mid-tower case with tempered glass side panel and pre-installed high-performance fans.",
        img: "https://netcodex.ph/wp-content/uploads/2025/04/Air-903-Base-Black-1.webp",
        price: "₱3,500",
        form_factor: "Mid Tower",
        tags: JSON.stringify(["Mid Tower", "Airflow", "Tempered Glass"])
      },
      {
        id: "asus-rog-strix-z690",
        category: "motherboard",
        name: "ASUS ROG Strix Z690-E Gaming WiFi",
        brand: "ASUS",
        desc: "High-end gaming motherboard with PCIe 5.0, robust power stages, and WiFi 6E.",
        img: "https://i.pinimg.com/736x/03/8b/63/038b634627abdf7d8ffafbb73b6f5055.jpg",
        price: "₱28,500",
        socket_type: "LGA1700",
        ddr_type: "DDR5",
        form_factor: "ATX",
        tags: JSON.stringify(["LGA1700", "DDR5", "ATX", "PCIe 5.0"])
      },
      {
        id: "asus-prime-b660m",
        category: "motherboard",
        name: "ASUS Prime B660M-A WiFi",
        brand: "ASUS",
        desc: "Reliable mATX motherboard for Intel 12th/13th/14th gen processors.",
        img: "https://i.pinimg.com/1200x/aa/7a/b6/aa7ab6601d825d397bdc9a0ef0536107.jpg",
        price: "₱8,500",
        socket_type: "LGA1700",
        ddr_type: "DDR4",
        form_factor: "mATX",
        tags: JSON.stringify(["LGA1700", "DDR4", "mATX"])
      },
      {
        id: "amd-ryzen7-5700x",
        category: "cpu",
        name: "AMD Ryzen 7 5700X",
        brand: "AMD",
        desc: "8-core, 16-thread processor on AM4 platform with high power efficiency.",
        img: "https://i.pinimg.com/1200x/1f/2c/6e/1f2c6e6851d3343b285615ee65ede44c.jpg",
        price: "₱10,800",
        socket_type: "AM4",
        wattage: 65,
        tags: JSON.stringify(["AM4", "65W", "8 cores", "Zen 3"])
      },
      {
        id: "corsair-dominator-ddr5-32gb",
        category: "ram",
        name: "Corsair Dominator Platinum RGB 32GB (2x16GB)",
        brand: "Corsair",
        desc: "Iconic aluminum heatspreader with Capellix RGB LEDs and 6000MHz ultra-low latency.",
        img: "https://i.pinimg.com/1200x/24/32/a7/2432a792587ec1347b7f0b9b952a559f.jpg",
        price: "₱12,500",
        ddr_type: "DDR5",
        capacity: "32GB",
        tags: JSON.stringify(["DDR5", "32GB", "6000MHz", "RGB"])
      },
      {
        id: "corsair-hx850x",
        category: "psu",
        name: "Corsair HX850 850W Platinum Fully Modular",
        brand: "Corsair",
        desc: "80 PLUS Platinum efficiency, Zero RPM fan mode, and 100% Japanese 105°C capacitors.",
        img: "https://assets.corsair.com/image/upload/c_pad,q_85,h_360,w_360/products/Power-Supply-Units/CMPSU-850HX/Gallery/hx850_01.webp",
        price: "₱9,200",
        wattage: 850,
        tags: JSON.stringify(["850W", "80+ Platinum", "Fully Modular"])
      }
    ];

    const [cols] = await db.query("DESCRIBE pc_parts");
    const colSet = new Set(cols.map(c => c.Field));

    await db.query("UPDATE pc_parts SET id = 'case1' WHERE id = '' AND name = 'Montech AIR-903-base'");

    for (const part of essentialParts) {
      const [existing] = await db.query(
        "SELECT id FROM pc_parts WHERE id = ? OR name = ? LIMIT 1",
        [part.id, part.name]
      );
      if (existing.length === 0) {
        const fields = Object.keys(part).filter(k => colSet.has(k));
        const quotedFields = fields.map(f => `\`${f}\``);
        const values = fields.map(k => part[k]);
        const placeholders = fields.map(() => "?").join(", ");
        await db.query(
          `INSERT INTO pc_parts (${quotedFields.join(", ")}) VALUES (${placeholders})`,
          values
        );
        console.log("Seeded essential part:", part.name);
      }
    }
  } catch (err) {
    console.error("Essential parts seed error:", err.message);
  }
}
seedEssentialCompatibleParts();

// Ensure tables and default data for admin accounts and content management exist
async function initContentAndAccountsSchema() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS admin_accounts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        email VARCHAR(120) NOT NULL,
        role VARCHAR(50) DEFAULT 'Administrator',
        avatar_url LONGTEXT DEFAULT NULL,
        passcode VARCHAR(100) DEFAULT 'admin12345',
        status VARCHAR(30) DEFAULT 'ACTIVE',
        last_login TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Team content lives in backend/data/team-members.json (git-tracked).
    // The legacy team_members MySQL table is intentionally no longer used.

    // Ensure google_learner_accounts table exists for Google OAuth Learners
    await db.query(`
      CREATE TABLE IF NOT EXISTS google_learner_accounts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        google_id VARCHAR(100) UNIQUE,
        email VARCHAR(150) NOT NULL,
        full_name VARCHAR(150) NOT NULL,
        avatar_url LONGTEXT,
        institution VARCHAR(150) DEFAULT 'Pateros Technological College',
        mode VARCHAR(50) DEFAULT 'learn',
        unlocked_stages LONGTEXT,
        pin_hash VARCHAR(255) NULL,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const [learnerCols] = await db.query("DESCRIBE google_learner_accounts");
    if (!learnerCols.map((c) => c.Field).includes("pin_hash")) {
      await db.query("ALTER TABLE google_learner_accounts ADD COLUMN pin_hash VARCHAR(255) NULL");
    }

    // Ensure single shared root admin exists with credentials: ID: root / Password: admin12345
    const [rootCheck] = await db.query("SELECT id FROM admin_accounts WHERE username = 'root'");
    if (rootCheck.length === 0) {
      await db.query(`
        INSERT INTO admin_accounts (username, display_name, email, role, avatar_url, passcode, status) VALUES 
        ('root', 'Root Administrator', 'root@buildlab.internal', 'Root Administrator', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200', 'admin12345', 'ACTIVE')
      `);
    }

    // Seed sample Google learner accounts if empty
    const [learnerCount] = await db.query("SELECT COUNT(*) as c FROM google_learner_accounts");
    if (!learnerCount[0]?.c) {
      await db.query(`
        INSERT INTO google_learner_accounts (google_id, email, full_name, avatar_url, institution, mode, unlocked_stages) VALUES
        ('google-oauth2|1092837482910', 'student.lead@gmail.com', 'Alex Rivera', 'https://api.dicebear.com/7.x/initials/svg?seed=Alex+Rivera&backgroundColor=00e5a0', 'Pateros Technological College', 'learn', '["build", "compatibility", "learn", "certificate"]'),
        ('google-oauth2|1092837482911', 'builder.mark@gmail.com', 'Mark Joshua Castro', 'https://api.dicebear.com/7.x/initials/svg?seed=Mark+Joshua&backgroundColor=38bdf8', 'Pateros Technological College', 'learn', '["build", "compatibility"]'),
        ('google-oauth2|1092837482912', 'chloe.tech@gmail.com', 'Chloe Santos', 'https://api.dicebear.com/7.x/initials/svg?seed=Chloe+Santos&backgroundColor=f43f5e', 'Pateros Technological College', 'learn', '["build", "compatibility", "learn"]')
      `);
    }

  } catch (err) {
    console.error("Content and accounts schema init error:", err.message);
  }
}
initContentAndAccountsSchema();

// API to get all parts grouped by category (filters out archived by default unless include_archived=true or archived=true)
app.get("/api/parts", async (req, res) => {
  try {
    let sql = "SELECT * FROM pc_parts";
    if (req.query.archived === "true") {
      sql += " WHERE is_archived = 1";
    } else if (req.query.include_archived !== "true") {
      sql += " WHERE (is_archived = 0 OR is_archived IS NULL)";
    }
    sql += " ORDER BY id DESC";

    const [rows] = await db.query(sql);
    const componentsData = {};
    rows.forEach(row => {
      if (!componentsData[row.category]) {
        componentsData[row.category] = [];
      }
      
      const item = { ...row };
      item.desc = item.desc || "";
      item.name = item.name || "";
      item.brand = item.brand || "";
      item.created_at = item.created_at || new Date().toISOString();
      item.is_archived = Boolean(row.is_archived);
      item.deleted_at = row.deleted_at || null;

      if (typeof item.tags === 'string') {
        try { item.tags = JSON.parse(item.tags); } catch(e) {}
      }

      componentsData[row.category].push(item);
    });
    res.json(componentsData);
  } catch (err) {
    console.error("GET /api/parts error:", err);
    res.status(500).json({ error: "Failed to fetch components" });
  }
});

// API to get parts by category (filters out archived by default unless include_archived=true or archived=true)
app.get("/api/parts/:category", async (req, res) => {
  try {
    let sql = "SELECT * FROM pc_parts WHERE category = ?";
    if (req.query.archived === "true") {
      sql += " AND is_archived = 1";
    } else if (req.query.include_archived !== "true") {
      sql += " AND (is_archived = 0 OR is_archived IS NULL)";
    }
    sql += " ORDER BY id DESC";

    const [rows] = await db.query(sql, [req.params.category]);
    res.json(rows.map(row => {
      const item = { ...row };
      item.desc = item.desc || "";
      item.name = item.name || "";
      item.brand = item.brand || "";
      item.created_at = item.created_at || new Date().toISOString();
      item.is_archived = Boolean(row.is_archived);
      item.deleted_at = row.deleted_at || null;
      if (typeof item.tags === 'string') {
        try { item.tags = JSON.parse(item.tags); } catch(e) {}
      }
      return item;
    }));
  } catch (err) {
    console.error(`GET /api/parts/${req.params.category} error:`, err);
    res.status(500).json({ error: "Failed to fetch category components" });
  }
});

// API to get a single part by ID
app.get("/api/parts/item/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM pc_parts WHERE id = ?", [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Component not found" });
    }
    const item = { ...rows[0] };
    item.desc = item.desc || "";
    item.name = item.name || "";
    item.brand = item.brand || "";
    if (typeof item.tags === 'string') {
      try { item.tags = JSON.parse(item.tags); } catch(e) {}
    }
    res.json(item);
  } catch (err) {
    console.error(`GET /api/parts/item/${req.params.id} error:`, err);
    res.status(500).json({ error: "Failed to fetch component" });
  }
});

// API to insert a part (Admin Protected)
app.post("/api/parts", adminAuth, async (req, res) => {
  try {
    const {
      id, category, img, brand, name, desc, price, tags,
      socket_type, ddr_type, form_factor, power_required,
      wattage, capacity, speed, type, efficiency
    } = req.body;

    const tagsJson = JSON.stringify(tags || []);

    const query = `
      INSERT INTO pc_parts 
      (id, category, img, brand, name, \`desc\`, price, tags, socket_type, ddr_type, form_factor, power_required, wattage, capacity, speed, type, efficiency) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      category=VALUES(category), img=VALUES(img), brand=VALUES(brand), name=VALUES(name), \`desc\`=VALUES(\`desc\`), 
      price=VALUES(price), tags=VALUES(tags), socket_type=VALUES(socket_type), ddr_type=VALUES(ddr_type), 
      form_factor=VALUES(form_factor), power_required=VALUES(power_required), wattage=VALUES(wattage), 
      capacity=VALUES(capacity), speed=VALUES(speed), type=VALUES(type), efficiency=VALUES(efficiency)
    `;

    const values = [
      id, category, img || null, brand || null, name || null, desc || null, price || null, tagsJson,
      socket_type || null, ddr_type || null, form_factor || null, power_required || null,
      wattage || null, capacity || null, speed || null, type || null, efficiency || null
    ];

    await db.query(query, values);
    logSystemActivity({
      actionType: "ADD_COMPONENT",
      adminUser: "Admin",
      details: `Created or upserted component "${name}" (${brand || "Generic"}) in [${category.toUpperCase()}].`,
      targetId: id,
      targetCategory: category,
      status: "SUCCESS",
      req
    });
    res.json({ success: true, message: "Part created/updated successfully" });
  } catch (err) {
    console.error("POST /api/parts error:", err);
    logSystemActivity({
      actionType: "ADD_COMPONENT_FAILED",
      adminUser: "Admin",
      details: `Failed to save component: ${err.message}`,
      targetId: req.body?.id || null,
      targetCategory: req.body?.category || null,
      status: "ERROR",
      req
    });
    res.status(500).json({ error: "Failed to save component" });
  }
});

// API to delete/archive a part (Soft-delete by default, permanent hard delete if ?permanent=true)
app.delete("/api/parts/:id", adminAuth, async (req, res) => {
  try {
    const isPermanent = req.query.permanent === "true" || req.query.hard === "true";
    const [existing] = await db.query("SELECT name, category, brand, is_archived FROM pc_parts WHERE id = ?", [req.params.id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: "Component not found" });
    }

    const partInfo = `"${existing[0].name}" (${existing[0].brand || "Generic"})`;

    if (isPermanent) {
      const [result] = await db.query("DELETE FROM pc_parts WHERE id = ?", [req.params.id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Component not found" });
      }
      logSystemActivity({
        actionType: "PERMANENT_DELETE_COMPONENT",
        adminUser: "Admin",
        details: `Permanently purged component ${partInfo} from database records.`,
        targetId: req.params.id,
        targetCategory: existing[0]?.category || null,
        status: "SUCCESS",
        req
      });
      return res.json({ success: true, message: "Component permanently deleted from database" });
    } else {
      // Soft-delete pattern: update is_archived = 1, deleted_at = NOW()
      await db.query("UPDATE pc_parts SET is_archived = 1, deleted_at = NOW() WHERE id = ?", [req.params.id]);
      logSystemActivity({
        actionType: "ARCHIVE_COMPONENT",
        adminUser: "Admin",
        details: `Archived component ${partInfo}. Moved to trash/archive repository.`,
        targetId: req.params.id,
        targetCategory: existing[0]?.category || null,
        status: "SUCCESS",
        req
      });
      return res.json({ success: true, message: "Component archived successfully" });
    }
  } catch (err) {
    console.error(`DELETE /api/parts/${req.params.id} error:`, err);
    res.status(500).json({ error: "Failed to archive/delete component" });
  }
});

// API to restore an archived component back to active inventory (Admin Protected)
app.post("/api/parts/:id/restore", adminAuth, async (req, res) => {
  try {
    const [existing] = await db.query("SELECT name, category, brand, is_archived FROM pc_parts WHERE id = ?", [req.params.id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: "Component not found" });
    }

    await db.query("UPDATE pc_parts SET is_archived = 0, deleted_at = NULL WHERE id = ?", [req.params.id]);
    const partInfo = `"${existing[0].name}" (${existing[0].brand || "Generic"})`;
    logSystemActivity({
      actionType: "RESTORE_COMPONENT",
      adminUser: "Admin",
      details: `Restored archived component ${partInfo} to active inventory.`,
      targetId: req.params.id,
      targetCategory: existing[0]?.category || null,
      status: "SUCCESS",
      req
    });
    res.json({ success: true, message: "Component restored to active inventory" });
  } catch (err) {
    console.error(`POST /api/parts/${req.params.id}/restore error:`, err);
    res.status(500).json({ error: "Failed to restore component" });
  }
});
app.put("/api/parts/:id/restore", adminAuth, async (req, res) => {
  req.url = req.url.replace('/restore', '/restore');
  // Re-run handler directly
  try {
    const [existing] = await db.query("SELECT name, category, brand, is_archived FROM pc_parts WHERE id = ?", [req.params.id]);
    if (!existing || existing.length === 0) return res.status(404).json({ error: "Component not found" });
    await db.query("UPDATE pc_parts SET is_archived = 0, deleted_at = NULL WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Component restored to active inventory" });
  } catch (err) {
    res.status(500).json({ error: "Failed to restore component" });
  }
});

// API to update a part (Admin Protected, with 404 validation)
app.put("/api/parts/:id", adminAuth, async (req, res) => {
  try {
    const {
      category, img, brand, name, desc, price, tags,
      socket_type, ddr_type, form_factor, power_required,
      wattage, capacity, speed, type, efficiency
    } = req.body;

    const tagsJson = JSON.stringify(tags || []);

    const query = `
      UPDATE pc_parts SET
        category = ?, img = ?, brand = ?, name = ?, \`desc\` = ?, price = ?, tags = ?,
        socket_type = ?, ddr_type = ?, form_factor = ?, power_required = ?,
        wattage = ?, capacity = ?, speed = ?, type = ?, efficiency = ?
      WHERE id = ?
    `;

    const values = [
      category, img || null, brand || null, name || null, desc || null, price || null, tagsJson,
      socket_type || null, ddr_type || null, form_factor || null, power_required || null,
      wattage || null, capacity || null, speed || null, type || null, efficiency || null,
      req.params.id
    ];

    const [result] = await db.query(query, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Component not found" });
    }
    logSystemActivity({
      actionType: "UPDATE_COMPONENT",
      adminUser: "Admin",
      details: `Updated specifications & attributes for "${name}" (${brand || "Generic"}).`,
      targetId: req.params.id,
      targetCategory: category,
      status: "SUCCESS",
      req
    });
    res.json({ success: true, message: "Component updated successfully" });
  } catch (err) {
    console.error(`PUT /api/parts/${req.params.id} error:`, err);
    res.status(500).json({ error: "Failed to update component" });
  }
});

// API to get saved builds
app.get("/api/builds", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM saved_builds");
    const builds = [null, null, null];
    rows.forEach(row => {
      builds[row.slot_id] = typeof row.build_data === 'string' ? JSON.parse(row.build_data) : row.build_data;
    });
    res.json(builds);
  } catch (err) {
    console.error("GET /api/builds error:", err);
    res.status(500).json({ error: "Failed to fetch saved builds" });
  }
});

// API to save a build
app.post("/api/builds/:slot", async (req, res) => {
  try {
    const slot = parseInt(req.params.slot, 10);
    const buildData = JSON.stringify(req.body);
    await db.query(
      "INSERT INTO saved_builds (slot_id, build_data) VALUES (?, ?) ON DUPLICATE KEY UPDATE build_data = VALUES(build_data)",
      [slot, buildData]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(`POST /api/builds/${req.params.slot} error:`, err);
    res.status(500).json({ error: "Failed to save build" });
  }
});

// API to delete/clear a build slot
app.delete("/api/builds/:slot", async (req, res) => {
  try {
    const slot = parseInt(req.params.slot, 10);
    await db.query("DELETE FROM saved_builds WHERE slot_id = ?", [slot]);
    res.json({ success: true });
  } catch (err) {
    console.error(`DELETE /api/builds/${req.params.slot} error:`, err);
    res.status(500).json({ error: "Failed to delete build slot" });
  }
});

// Admin stats endpoint (KPI dashboard)
app.get("/api/admin/stats", async (req, res) => {
  try {
    const [categoryRows] = await db.query("SELECT category, COUNT(*) as count FROM pc_parts GROUP BY category");
    const [totalPartsRows] = await db.query("SELECT COUNT(*) as total FROM pc_parts");
    const [totalBuildsRows] = await db.query("SELECT COUNT(*) as total FROM saved_builds");

    const categoryBreakdown = {};
    categoryRows.forEach((row) => {
      categoryBreakdown[row.category] = row.count;
    });

    res.json({
      success: true,
      dbConnected: true,
      totalParts: totalPartsRows[0]?.total || 0,
      totalSavedBuilds: totalBuildsRows[0]?.total || 0,
      categories: categoryBreakdown,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("GET /api/admin/stats error:", err);
    res.status(500).json({ success: false, dbConnected: false, error: "Failed to fetch telemetry" });
  }
});

// Admin database sanitization endpoint (Clean noisy crawler data, Admin Protected)
app.post("/api/admin/clean-db", adminAuth, async (req, res) => {
  try {
    const queries = [
      "DELETE FROM pc_parts WHERE LOWER(name) LIKE '%laptop%' OR LOWER(name) LIKE '%notebook%' OR LOWER(name) LIKE '%vivobook%' OR LOWER(name) LIKE '%ideapad%' OR LOWER(name) LIKE '%aspire%' OR LOWER(name) LIKE '%nitro%' OR LOWER(name) LIKE '%cyborg%' OR LOWER(name) LIKE '%modern 14%' OR LOWER(name) LIKE '%zenbook%' OR LOWER(name) LIKE '%macbook%' OR LOWER(name) LIKE '%thinkpad%' OR LOWER(name) LIKE '%fhd ips%' OR LOWER(name) LIKE '%14.0\"%' OR LOWER(name) LIKE '%15.6\"%'",
      "DELETE FROM pc_parts WHERE (category = 'cpu' AND (LOWER(name) LIKE '%desktop pc%' OR LOWER(name) LIKE '%gaming desktop%' OR LOWER(name) LIKE '%thin 15%' OR LOWER(name) LIKE '%ldc 15250%' OR LOWER(name) LIKE '%musetex%'))",
      "DELETE FROM pc_parts WHERE (category = 'psu' AND (LOWER(name) LIKE '%bluetti%' OR LOWER(name) LIKE '%solar%' OR LOWER(name) LIKE '%portable%' OR LOWER(name) LIKE '%generator%' OR LOWER(name) LIKE '%power station%' OR LOWER(name) LIKE '%pv130%' OR LOWER(name) LIKE '%ac2p%'))",
      "DELETE FROM pc_parts WHERE LOWER(name) LIKE '%cooler%' AND category = 'cpu'"
    ];

    let totalDeleted = 0;
    for (const q of queries) {
      const [resQuery] = await db.query(q);
      totalDeleted += resQuery.affectedRows || 0;
    }

    logSystemActivity({
      actionType: "SANITIZE_DATABASE",
      adminUser: "Admin",
      details: `Executed database sanitization routine: purged ${totalDeleted} invalid/miscategorized items.`,
      targetId: "CLEAN_DB",
      targetCategory: "system",
      status: "SUCCESS",
      req
    });

    res.json({
      success: true,
      message: `Database cleaned: ${totalDeleted} invalid/miscategorized items removed.`,
      deletedCount: totalDeleted
    });
  } catch (err) {
    console.error("POST /api/admin/clean-db error:", err);
    res.status(500).json({ success: false, error: "Failed to sanitize database" });
  }
});

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ status: "healthy", database: "connected" });
  } catch (err) {
    res.status(503).json({ status: "degraded", database: "disconnected" });
  }
});

// ── Admin System Logs & Telemetry Endpoints ──
app.get("/api/admin/logs", adminAuth, async (req, res) => {
  try {
    const limit = Math.min(200, Math.max(10, parseInt(req.query.limit || "100", 10)));
    const filterType = req.query.type;
    let query = "SELECT * FROM system_logs";
    const params = [];

    if (filterType && filterType !== "all") {
      query += " WHERE action_type = ? OR target_category = ?";
      params.push(filterType, filterType);
    }

    query += " ORDER BY id DESC LIMIT ?";
    params.push(limit);

    const [rows] = await db.query(query, params);
    res.json({ success: true, logs: rows });
  } catch (err) {
    console.error("GET /api/admin/logs error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch system logs" });
  }
});

// System Status endpoint (Detailed status for System Logs page)
app.get("/api/admin/system-status", adminAuth, async (req, res) => {
  try {
    const startTime = Date.now();
    let dbStatus = "operational";
    let dbLatencyMs = 0;
    try {
      await db.query("SELECT 1");
      dbLatencyMs = Date.now() - startTime;
    } catch (e) {
      dbStatus = "down";
    }

    const [partsCount] = await db.query("SELECT COUNT(*) as count FROM pc_parts");
    const [scrapedCount] = await db.query("SELECT COUNT(*) as count FROM scraped_queue");
    const [logsCount] = await db.query("SELECT COUNT(*) as count FROM system_logs");
    const [lastLog] = await db.query("SELECT created_at FROM system_logs ORDER BY id DESC LIMIT 1");

    const uptimeSec = Math.floor(process.uptime());
    const memoryUsage = process.memoryUsage();

    res.json({
      success: true,
      system: {
        engine: "ONLINE",
        version: "v1.0.4",
        environment: process.env.NODE_ENV || "development",
        serverTime: new Date().toISOString(),
        uptimeSeconds: uptimeSec,
        memoryHeapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100,
        memoryRssMB: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100
      },
      services: {
        database: {
          name: "MySQL (buildlab_db)",
          status: dbStatus,
          latencyMs: dbLatencyMs,
          totalParts: partsCount[0]?.count || 0,
          pendingScrapes: scrapedCount[0]?.count || 0
        },
        apiServer: {
          status: "operational",
          port: process.env.PORT || 5000,
          totalAuditEntries: logsCount[0]?.count || 0,
          lastActivityAt: lastLog[0]?.created_at || new Date().toISOString()
        },
        crawlerEngine: {
          status: "standby / ready",
          targets: ["EasyPC", "Bermor Techzone"]
        }
      }
    });
  } catch (err) {
    console.error("GET /api/admin/system-status error:", err);
    res.status(500).json({ success: false, error: "Failed to inspect system status" });
  }
});

// Clear or purge old system logs (Admin Protected)
app.delete("/api/admin/logs", adminAuth, async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM system_logs");
    await logSystemActivity({
      actionType: "PURGE_LOGS",
      adminUser: "Admin",
      details: `Purged system logs audit history (${result.affectedRows} entries cleared).`,
      targetId: "SYSTEM_LOGS",
      targetCategory: "system",
      status: "SUCCESS",
      req
    });
    res.json({ success: true, message: `Cleared ${result.affectedRows} log entries.` });
  } catch (err) {
    console.error("DELETE /api/admin/logs error:", err);
    res.status(500).json({ success: false, error: "Failed to clear logs" });
  }
});

// SCRAPED DATA REVIEW QUEUE ENDPOINTS

// API to get all unverified scraped components
app.get("/api/scraped-queue", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM scraped_queue ORDER BY id DESC");
    res.json(rows.map(row => ({
      ...row,
      tags: typeof row.tags === 'string' ? JSON.parse(row.tags || "[]") : (row.tags || []),
      approved: Boolean(row.approved)
    })));
  } catch (err) {
    console.error("GET /api/scraped-queue error:", err);
    res.status(500).json({ error: "Failed to fetch review queue" });
  }
});

// API to toggle approval of a scraped item (Admin Protected)
app.post("/api/scraped-queue/approve/:id", adminAuth, async (req, res) => {
  try {
    await db.query("UPDATE scraped_queue SET approved = NOT approved WHERE id = ?", [req.params.id]);
    const [updated] = await db.query("SELECT * FROM scraped_queue WHERE id = ?", [req.params.id]);
    res.json({ success: true, item: updated[0] });
  } catch (err) {
    console.error(`POST /api/scraped-queue/approve/${req.params.id} error:`, err);
    res.status(500).json({ error: "Failed to toggle component approval" });
  }
});

// API to discard / delete a scraped item from the review queue (Admin Protected)
app.delete("/api/scraped-queue/:id", adminAuth, async (req, res) => {
  try {
    await db.query("DELETE FROM scraped_queue WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Scraped component discarded from queue." });
  } catch (err) {
    console.error(`DELETE /api/scraped-queue/${req.params.id} error:`, err);
    res.status(500).json({ error: "Failed to discard item" });
  }
});

// API to clear reviewed-item checkboxes (multi-selected) from the review queue (Admin Protected)
app.post("/api/scraped-queue/clear-selected", adminAuth, async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter(Boolean) : [];
    if (ids.length === 0) {
      return res.status(400).json({ error: "No items selected for clearing." });
    }
    const placeholders = ids.map(() => "?").join(", ");
    const [result] = await db.query(
      `DELETE FROM scraped_queue WHERE id IN (${placeholders})`,
      ids
    );
    res.json({
      success: true,
      deleted: result.affectedRows,
      message: `Cleared ${result.affectedRows} selected scraped item(s) from the queue.`
    });
  } catch (err) {
    console.error("POST /api/scraped-queue/clear-selected error:", err);
    res.status(500).json({ error: "Failed to clear selected items" });
  }
});

// API to clear the entire recently scraped review queue (Admin Protected)
app.delete("/api/scraped-queue", adminAuth, async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM scraped_queue");
    res.json({
      success: true,
      deleted: result.affectedRows,
      message: `Review queue cleared — removed ${result.affectedRows} recently scraped item(s).`
    });
  } catch (err) {
    console.error("DELETE /api/scraped-queue error:", err);
    res.status(500).json({ error: "Failed to clear the review queue" });
  }
});

// API to merge all approved scraped items into production pc_parts table (Admin Protected)
app.post("/api/scraped-queue/merge", adminAuth, async (req, res) => {
  let conn;
  try {
    const [approvedItems] = await db.query("SELECT * FROM scraped_queue WHERE approved = 1");
    if (!approvedItems || approvedItems.length === 0) {
      return res.status(400).json({ error: "No items are approved for merging." });
    }

    conn = await db.getConnection();
    await conn.beginTransaction();

    let mergedCount = 0;
    for (const item of approvedItems) {
      // Deduplicate: check if a part with same name already exists in active inventory
      const [existingByName] = await conn.query("SELECT id FROM pc_parts WHERE LOWER(name) = LOWER(?)", [item.scraped_name]);
      let prodId;
      if (existingByName && existingByName.length > 0) {
        prodId = existingByName[0].id;
      } else {
        prodId = item.id.startsWith("easypc-") || item.id.startsWith("bermor-") ? item.id : `prod-${item.id}`;
      }

      const query = `
        INSERT INTO pc_parts 
        (id, category, img, brand, name, \`desc\`, price, tags, socket_type, ddr_type, form_factor, power_required, wattage, capacity, speed, type, efficiency, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
        category=VALUES(category), img=VALUES(img), brand=VALUES(brand), name=VALUES(name), \`desc\`=VALUES(\`desc\`),
        price=VALUES(price), tags=VALUES(tags), socket_type=VALUES(socket_type), ddr_type=VALUES(ddr_type),
        form_factor=VALUES(form_factor), wattage=VALUES(wattage), created_at=NOW()
      `;
      const values = [
        prodId, item.category || "case", item.img || "/pcbackground.png",
        item.brand || "GIGABYTE", item.scraped_name, item.desc || "Verified from EasyPC",
        item.price || null, typeof item.tags === 'string' ? item.tags : JSON.stringify(item.tags || ["Verified", "EasyPC"]),
        item.socket_type || null, item.ddr_type || null, item.form_factor || null,
        item.power_required || null, item.wattage || null, item.capacity || null,
        item.speed || null, item.type || null, item.efficiency || null
      ];

      await conn.query(query, values);
      mergedCount++;
    }

    await conn.query("DELETE FROM scraped_queue WHERE approved = 1");
    await conn.commit();

    logSystemActivity({
      actionType: "MERGE_SCRAPED_DATA",
      adminUser: "Admin",
      details: `Merged ${mergedCount} approved scraped components from review queue into production inventory.`,
      targetId: "QUEUE_MERGE",
      targetCategory: "all",
      status: "SUCCESS",
      req
    });

    res.json({
      success: true,
      mergedCount,
      message: `Successfully verified and merged ${mergedCount} item(s) from EasyPC into production inventory!`
    });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("Scraped queue merge error:", err);
    res.status(500).json({ error: "Failed to merge verified components" });
  } finally {
    if (conn) conn.release();
  }
});

// API to trigger crawler (scraping EasyPC or Bermor Techzone to Review Queue, Admin Protected)
app.post("/api/crawl", adminAuth, (req, res) => {
  const ALLOWED_STORES = ["EasyPC", "Bermor Techzone"];
  const ALLOWED_CATEGORIES = ["all", "case", "motherboard", "cpu", "ram", "gpu", "storage", "psu"];

  const store = ALLOWED_STORES.includes(req.body?.store) ? req.body.store : "EasyPC";
  const category = ALLOWED_CATEGORIES.includes(req.body?.category) ? req.body.category : "all";
  const maxPages = Math.min(5, Math.max(1, parseInt(req.body?.maxPages, 10) || 1));
  const scriptPath = path.join(__dirname, "crawler.js");

  const args = [
    scriptPath,
    `--store=${store}`,
    `--category=${category}`,
    `--pages=${maxPages}`
  ];

  execFile(process.execPath, args, { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Crawler execution error: ${error.message}`);
      return res.status(500).json({ error: error.message, stderr, output: stdout });
    }
    res.json({
      success: true,
      message: `${store} crawling finished. Components placed into Scraped Data Review Queue.`,
      output: stdout,
      store,
      category,
      maxPages
    });
  });
});

// ── Profile Photo Upload API ──
app.post("/api/upload/profile-photo", adminAuth, (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "No image payload provided" });
    }

    if (image.startsWith("data:image/")) {
      const matches = image.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: "Invalid base64 image format" });
      }

      let ext = matches[1].toLowerCase();
      if (ext === "jpeg") ext = "jpg";
      if (ext.includes("+")) ext = ext.split("+")[0];

      const allowedExts = ["jpg", "jpeg", "png", "webp"];
      if (!allowedExts.includes(ext) || ext.includes("svg") || ext.includes("html") || ext.includes("xml")) {
        return res.status(400).json({ error: "Unsupported image format. Allowed: JPG, PNG, WEBP." });
      }

      const buffer = Buffer.from(matches[2], "base64");
      const safeName = `photo-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const targetPath = path.join(uploadsDir, safeName);

      fs.writeFileSync(targetPath, buffer);
      const publicUrl = `/uploads/profiles/${safeName}`;
      return res.json({ success: true, url: publicUrl, filename: safeName });
    }

    if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("/uploads/")) {
      return res.json({ success: true, url: image });
    }

    return res.status(400).json({ error: "Unsupported image payload" });
  } catch (err) {
    console.error("Profile photo upload error:", err);
    res.status(500).json({ error: "Failed to upload profile photo" });
  }
});

// ── Admin Accounts APIs ──
app.get("/api/admin/accounts", adminAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, username, display_name, email, role, avatar_url, status, last_login, created_at, updated_at FROM admin_accounts ORDER BY id ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Fetch admin accounts error:", err);
    res.status(500).json({ error: "Failed to fetch admin accounts" });
  }
});

app.post("/api/admin/accounts", adminAuth, async (req, res) => {
  try {
    const { username, display_name, email, role, avatar_url, passcode, status } = req.body;
    if (!username || !display_name) {
      return res.status(400).json({ error: "Username and display name are required" });
    }

    const [existing] = await db.query("SELECT id FROM admin_accounts WHERE username = ?", [username.trim()]);
    if (existing.length > 0) {
      return res.status(400).json({ error: `Username '${username}' is already in use.` });
    }

    const [result] = await db.query(
      `INSERT INTO admin_accounts (username, display_name, email, role, avatar_url, passcode, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        username.trim(),
        display_name.trim(),
        email ? email.trim() : `${username.trim()}@buildlab.internal`,
        role || "Administrator",
        avatar_url || null,
        passcode || "admin12345",
        status || "ACTIVE"
      ]
    );

    res.json({
      success: true,
      id: result.insertId,
      message: `Admin account '${username}' created successfully.`
    });
  } catch (err) {
    console.error("Create admin account error:", err);
    res.status(500).json({ error: "Failed to create admin account" });
  }
});

app.put("/api/admin/accounts/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { display_name, email, role, avatar_url, passcode, status } = req.body;

    const fields = [];
    const values = [];

    if (display_name !== undefined) { fields.push("display_name = ?"); values.push(display_name.trim()); }
    if (email !== undefined) { fields.push("email = ?"); values.push(email.trim()); }
    if (role !== undefined) { fields.push("role = ?"); values.push(role); }
    if (avatar_url !== undefined) { fields.push("avatar_url = ?"); values.push(avatar_url); }
    if (passcode !== undefined && passcode.trim() !== "") { fields.push("passcode = ?"); values.push(passcode.trim()); }
    if (status !== undefined) { fields.push("status = ?"); values.push(status); }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields provided to update" });
    }

    values.push(id);
    await db.query(`UPDATE admin_accounts SET ${fields.join(", ")} WHERE id = ?`, values);

    res.json({ success: true, message: "Admin account updated successfully." });
  } catch (err) {
    console.error("Update admin account error:", err);
    res.status(500).json({ error: "Failed to update admin account" });
  }
});

app.delete("/api/admin/accounts/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const [total] = await db.query("SELECT COUNT(*) as c FROM admin_accounts");
    if (total[0].c <= 1) {
      return res.status(400).json({ error: "Cannot delete the sole remaining administrator account." });
    }
    const [target] = await db.query("SELECT username FROM admin_accounts WHERE id = ?", [id]);
    if (target.length > 0 && target[0].username === "admin") {
      return res.status(400).json({ error: "Root 'admin' account is protected and cannot be deleted." });
    }

    await db.query("DELETE FROM admin_accounts WHERE id = ?", [id]);
    res.json({ success: true, message: "Admin account deleted successfully." });
  } catch (err) {
    console.error("Delete admin account error:", err);
    res.status(500).json({ error: "Failed to delete admin account" });
  }
});

// ── Google Learner Accounts APIs (Live Directory for Admin Accounts Manager) ──
app.get("/api/admin/learners", adminAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, google_id, email, full_name, avatar_url, institution, mode, unlocked_stages, last_active, created_at FROM google_learner_accounts ORDER BY last_active DESC"
    );
    const parsed = rows.map((r) => {
      let stages = ["build"];
      try {
        stages = typeof r.unlocked_stages === "string" ? JSON.parse(r.unlocked_stages) : (r.unlocked_stages || ["build"]);
      } catch (_) {}
      return { ...r, unlocked_stages: stages };
    });
    res.json(parsed);
  } catch (err) {
    console.error("Fetch learners error:", err);
    res.status(500).json({ error: "Failed to fetch Google learner accounts" });
  }
});

// Returning learner lookup: lets the app restore a signed-in profile without re-running setup.
app.get("/api/learn/profile", async (req, res) => {
  try {
    const email = String(req.query.email || "").trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const [rows] = await db.query(
      "SELECT email, full_name, avatar_url, institution, unlocked_stages FROM google_learner_accounts WHERE LOWER(email) = ? LIMIT 1",
      [email]
    );
    if (!rows.length) {
      return res.status(404).json({ error: "No learner account found" });
    }

    const row = rows[0];
    let stages = ["build"];
    try {
      const parsed = typeof row.unlocked_stages === "string"
        ? JSON.parse(row.unlocked_stages)
        : row.unlocked_stages;
      if (Array.isArray(parsed) && parsed.length) stages = parsed;
    } catch (_) {}

    res.json({
      email: row.email,
      fullName: row.full_name,
      photo: row.avatar_url || "",
      institution: row.institution || "Pateros Technological College",
      unlockedStages: stages,
    });
  } catch (err) {
    console.error("Fetch learner profile error:", err);
    res.status(500).json({ error: "Failed to fetch learner profile" });
  }
});

app.post("/api/learn/sync-profile", async (req, res) => {
  try {
    const { googleId, email, fullName, photo, institution, unlockedStages } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const gid = googleId || `google-oauth2|${Date.now()}`;
    const name = (fullName || email.split("@")[0] || "Learner").trim();
    const stagesJson = typeof unlockedStages === "object" ? JSON.stringify(unlockedStages) : (unlockedStages || '["build"]');

    const [existing] = await db.query(
      "SELECT id, pin_hash FROM google_learner_accounts WHERE email = ? ORDER BY id DESC LIMIT 1",
      [email.trim()]
    );

    let pinHashValue = null;
    let pinMailed = false;
    if (!existing.length || !existing[0].pin_hash) {
      const pin = generatePin();
      pinHashValue = hashPin(pin);
      pinMailed = await mailPin(email.trim(), name, pin);
    }

    await db.query(
      `INSERT INTO google_learner_accounts (google_id, email, full_name, avatar_url, institution, mode, unlocked_stages, pin_hash, last_active)
       VALUES (?, ?, ?, ?, ?, 'learn', ?, ?, CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE 
         full_name = VALUES(full_name),
         avatar_url = COALESCE(VALUES(avatar_url), avatar_url),
         unlocked_stages = COALESCE(VALUES(unlocked_stages), unlocked_stages),
         pin_hash = COALESCE(VALUES(pin_hash), pin_hash),
         last_active = CURRENT_TIMESTAMP`,
      [gid, email.trim(), name, photo || null, institution || "Pateros Technological College", stagesJson, pinHashValue]
    );

    res.json({ success: true, message: "Google learner profile synchronized.", pinMailed });
  } catch (err) {
    console.error("Sync profile error:", err);
    res.status(500).json({ error: "Failed to sync learner profile" });
  }
});

app.post("/api/learn/reset-stages", async (req, res) => {
  try {
    const { email, pin } = req.body;
    if (!email || !/^\d{6}$/.test(String(pin || ""))) {
      return res.status(400).json({ error: "Enter the 6-digit security PIN." });
    }

    const [rows] = await db.query(
      "SELECT id, pin_hash FROM google_learner_accounts WHERE email = ? ORDER BY id DESC LIMIT 1",
      [email.trim()]
    );
    if (!rows.length || !rows[0].pin_hash || !verifyPin(String(pin), rows[0].pin_hash)) {
      return res.status(401).json({ error: "Incorrect security PIN." });
    }

    await db.query("UPDATE google_learner_accounts SET unlocked_stages = ? WHERE id = ?", [JSON.stringify(["build"]), rows[0].id]);
    res.json({ success: true, message: "Stage progression reset." });
  } catch (err) {
    console.error("Reset stages error:", err);
    res.status(500).json({ error: "Failed to reset stage progression" });
  }
});

app.delete("/api/admin/learners/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM google_learner_accounts WHERE id = ?", [id]);
    res.json({ success: true, message: "Learner account deleted successfully." });
  } catch (err) {
    console.error("Delete learner error:", err);
    res.status(500).json({ error: "Failed to delete learner account" });
  }
});

// ── Team / Content Management APIs (git-tracked JSON store) ──
app.get("/api/content/team", (req, res) => {
  try {
    res.json(teamStore.readTeam());
  } catch (err) {
    console.error("Fetch team content error:", err);
    res.status(500).json({ error: "Failed to fetch team content" });
  }
});

app.get("/api/content/team/:id", (req, res) => {
  const member = teamStore.getMember(req.params.id);
  if (!member) return res.status(404).json({ error: "Team member not found" });
  res.json(member);
});

app.put("/api/content/team/:id", adminAuth, (req, res) => {
  try {
    const updated = teamStore.upsertMember(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: `Member '${req.params.id}' not found.` });
    }
    res.json({
      success: true,
      member: updated,
      message: `Operative profile for ${updated.name || updated.id} saved to backend/data/team-members.json.`
    });
  } catch (err) {
    console.error("Update team content error:", err);
    res.status(500).json({ error: "Failed to update team content" });
  }
});

app.post("/api/content/team", adminAuth, (req, res) => {
  try {
    const payload = { ...(req.body || {}) };
    if (!payload.id) payload.id = `DEV-${Date.now().toString().slice(-6)}`;
    const created = teamStore.createMember(payload);
    res.status(201).json({
      success: true,
      id: created.id,
      member: created,
      message: "New operative created successfully."
    });
  } catch (err) {
    console.error("Create team content error:", err);
    const status = err.code === "DUPLICATE_ID" ? 409 : 400;
    res.status(status).json({ error: err.message || "Failed to create team member" });
  }
});

app.delete("/api/content/team/:id", adminAuth, (req, res) => {
  try {
    const removed = teamStore.deleteMember(req.params.id);
    if (!removed) return res.status(404).json({ error: `Member '${req.params.id}' not found.` });
    res.json({ success: true, message: `Operative ${req.params.id} removed.` });
  } catch (err) {
    console.error("Delete team content error:", err);
    res.status(500).json({ error: "Failed to delete team member" });
  }
});

// ── Serve Built Frontend (Production SPA) ──
const distPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(distPath, {
  setHeaders: (res, filePath) => {
    if (filePath.includes('/assets/') || filePath.includes('\\assets\\')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(distPath, "index.html"), (err) => {
    if (err) next();
  });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
