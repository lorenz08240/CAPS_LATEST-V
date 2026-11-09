require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const db = require("./config/db");

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
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// ── Admin Authentication Middleware ──
const adminAuth = (req, res, next) => {
  const adminKey = req.headers["x-admin-key"] || req.query.admin_key;
  const expectedKey = process.env.ADMIN_API_KEY || "admin123";

  // Accepts standard API key or single root password (admin12345)
  if (!adminKey || (adminKey !== expectedKey && adminKey !== "admin12345")) {
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
        passcode VARCHAR(100) DEFAULT 'admin123',
        status VARCHAR(30) DEFAULT 'ACTIVE',
        last_login TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        designation VARCHAR(150) NOT NULL,
        codename VARCHAR(50) NOT NULL,
        role_category VARCHAR(50) DEFAULT 'core',
        avatar_badge VARCHAR(30) DEFAULT 'DEV',
        photo_url LONGTEXT DEFAULT NULL,
        highlight VARCHAR(200) DEFAULT NULL,
        bio TEXT DEFAULT NULL,
        key_contributions LONGTEXT DEFAULT NULL,
        tech_stack LONGTEXT DEFAULT NULL,
        rig_specs LONGTEXT DEFAULT NULL,
        fav_tip TEXT DEFAULT NULL,
        github VARCHAR(255) DEFAULT 'https://github.com',
        linkedin VARCHAR(255) DEFAULT 'https://linkedin.com',
        sort_order INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

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
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure single shared root admin exists with credentials: ID: root / Password: admin12345
    const [rootCheck] = await db.query("SELECT id FROM admin_accounts WHERE username = 'root'");
    if (rootCheck.length === 0) {
      await db.query(`
        INSERT INTO admin_accounts (username, display_name, email, role, avatar_url, passcode, status) VALUES 
        ('root', 'Root Administrator', 'root@buildlab.internal', 'Root Administrator', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200', 'admin12345', 'ACTIVE')
      `);
    } else {
      await db.query("UPDATE admin_accounts SET passcode = 'admin12345', role = 'Root Administrator' WHERE username = 'root'");
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

    // Seed default team members if empty
    const [teamCount] = await db.query("SELECT COUNT(*) as c FROM team_members");
    if (!teamCount[0]?.c) {
      const defaultMembers = [
        [
          "DEV-01", "Developer 01", "Lead Systems Architect & Full-Stack Engineer", "SYSTEM_CORE", "core", "ARCH",
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
          "Core Architecture & State Matrix",
          "Leads the software architecture of BuildLab, bridging the React state machine with real-time 3D assembly graphs and the Node.js backend. Dedicated to zero-latency component selection and mathematical TDP validation.",
          JSON.stringify([
            "Engineered multi-tier component picker and dependency state tree",
            "Integrated Three.js WebGL canvas with live hardware inventory",
            "Architected real-time bottleneck and socket matching algorithms"
          ]),
          JSON.stringify(["React 19", "Three.js", "Node.js", "Express", "MySQL"]),
          JSON.stringify({
            cpu: "AMD Ryzen 9 7900X (12 Cores, 24 Threads)",
            gpu: "NVIDIA GeForce RTX 4080 Super 16GB",
            ram: "64GB DDR5-6000 CL30 (2x32GB)",
            storage: "2TB PCIe Gen4 NVMe M.2 SSD",
            chassis: "Lian Li O11 Dynamic EVO (Black)"
          }),
          "Never cheap out on your power supply. An efficient Tier-A PSU protects your entire investment from dirty power and transient voltage spikes.",
          "https://github.com", "https://linkedin.com", 1
        ],
        [
          "DEV-02", "Developer 02", "UI/UX Lead & Frontend Design Engineer", "CYBER_HUD", "frontend", "UI/UX",
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
          "Design Systems & Command Deck Interaction",
          "Designed BuildLab's cohesive dark cyberpunk aesthetic, the mahogany Command Deck drawer, sound-synchronized interactions, and accessible high-contrast telemetry across all screen viewports.",
          JSON.stringify([
            "Crafted the unified Wood-Mahogany Command Deck sidebar navigation",
            "Implemented Web Audio API procedural sound feedback system",
            "Optimized responsive mobile HUD layouts with zero horizontal clipping"
          ]),
          JSON.stringify(["React", "Motion/React", "CSS3 / Variables", "Web Audio API", "Figma"]),
          JSON.stringify({
            cpu: "Intel Core i7-14700K (20 Cores, 28 Threads)",
            gpu: "NVIDIA GeForce RTX 4070 Ti Super 16GB",
            ram: "32GB DDR5-5600 CL36 (2x16GB)",
            storage: "1TB Kingston KC3000 + 2TB Crucial P3",
            chassis: "NZXT H6 Flow Dual-Chamber"
          }),
          "Assemble your motherboard, CPU, RAM, and M.2 SSD on top of the motherboard box before placing anything inside the PC case. It gives you 360-degree clear visibility.",
          "https://github.com", "https://linkedin.com", 2
        ],
        [
          "DEV-03", "Developer 03", "3D Graphics & WebGL Simulation Engineer", "MESH_RENDER", "core", "3D/GL",
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
          "Three.js Hardware Models & Orbit Rigging",
          "Crafts the interactive 3D hardware studio, procedural PC components, physically based rendering (PBR) materials, and realistic socket snap-fit clearances using Three.js and WebGL shaders.",
          JSON.stringify([
            "Built the 3D Studio inspection viewport with smooth OrbitControls",
            "Engineered procedural heatsink sickle fans and RAM module geometry",
            "Calculated camera docking coordinates for all 7 hardware stages"
          ]),
          JSON.stringify(["Three.js", "WebGL", "GLTF / GLB", "Blender", "Canvas API"]),
          JSON.stringify({
            cpu: "AMD Ryzen 7 7800X3D (8 Cores, 3D V-Cache)",
            gpu: "AMD Radeon RX 7900 XTX 24GB",
            ram: "32GB DDR5-6000 CL30 Low-Latency Kit",
            storage: "2TB Samsung 990 Pro PCIe 4.0 NVMe",
            chassis: "Fractal Design North (Charcoal with Walnut Front)"
          }),
          "Remember to peel off the clear plastic protective film from the bottom of your CPU cooler's copper cold plate before mounting it with thermal paste!",
          "https://github.com", "https://linkedin.com", 3
        ],
        [
          "DEV-04", "Developer 04", "Backend & Database Systems Architect", "DATA_VAULT", "backend", "API/DB",
          "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=400",
          "MySQL Normalization & Crawler Pipeline",
          "Architected BuildLab's normalized MySQL relational database, RESTful Express services, and the automated crawler hub that manages hardware specifications and benchmark baselines.",
          JSON.stringify([
            "Designed normalized database schema for 7+ hardware categories",
            "Built headless crawler integration and admin verification queue",
            "Implemented secure JWT session management and admin inventory control"
          ]),
          JSON.stringify(["Node.js", "Express.js", "MySQL / MariaDB", "Cheerio", "JWT"]),
          JSON.stringify({
            cpu: "AMD Ryzen 9 5950X (16 Cores, 32 Threads)",
            gpu: "NVIDIA GeForce RTX 3080 10GB",
            ram: "64GB DDR4-3600 (4x16GB)",
            storage: "4TB NVMe SSD + 24TB Home NAS Storage",
            chassis: "Corsair 5000D Airflow"
          }),
          "Dual-channel memory goes into slots 2 and 4 (A2/B2). Check your motherboard's PCB silkscreen to ensure maximum signal trace impedance.",
          "https://github.com", "https://linkedin.com", 4
        ],
        [
          "DEV-05", "Developer 05", "Hardware Research Lead & QA Specialist", "VERIFY_LAB", "backend", "QA/SPEC",
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400",
          "Compatibility Matrices & Socket Verification",
          "Researched and documented hundreds of component socket standards, RAM clearance heights, PCIe lane bifurcation rules, and TDP dissipation curves to guarantee 100% accurate compatibility checks.",
          JSON.stringify([
            "Curated and verified 500+ component compatibility matrix rules",
            "Audited LGA1700/AM5 cooler bracket clearances and PSU modular pinout alerts",
            "Authored B.O.B. Interactive Troubleshooting Knowledge Base"
          ]),
          JSON.stringify(["Hardware Specs Audit", "Benchmarking", "Jest", "Data Verification"]),
          JSON.stringify({
            cpu: "Intel Core i5-13600K (14 Cores, 20 Threads)",
            gpu: "NVIDIA GeForce RTX 4060 Ti 16GB",
            ram: "32GB DDR4-3600 CL16",
            storage: "1TB WD Black SN850X NVMe SSD",
            chassis: "DeepCool CH560 Digital (Tempered Glass)"
          }),
          "Never mix modular PSU cables between different power supply units. The pinouts on the power supply side are not standardized and can permanently fry your motherboard.",
          "https://github.com", "https://linkedin.com", 5
        ]
      ];

      for (const m of defaultMembers) {
        await db.query(
          "INSERT INTO team_members (id, name, designation, codename, role_category, avatar_badge, photo_url, highlight, bio, key_contributions, tech_stack, rig_specs, fav_tip, github, linkedin, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          m
        );
      }
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
  try {
    const [approvedItems] = await db.query("SELECT * FROM scraped_queue WHERE approved = 1");
    if (!approvedItems || approvedItems.length === 0) {
      return res.status(400).json({ error: "No items are approved for merging." });
    }

    let mergedCount = 0;
    for (const item of approvedItems) {
      // Deduplicate: check if a part with same name already exists in active inventory
      const [existingByName] = await db.query("SELECT id FROM pc_parts WHERE LOWER(name) = LOWER(?)", [item.scraped_name]);
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

      await db.query(query, values);
      mergedCount++;
    }

    await db.query("DELETE FROM scraped_queue WHERE approved = 1");

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
    console.error("Scraped queue merge error:", err);
    res.status(500).json({ error: "Failed to merge verified components" });
  }
});

// API to trigger crawler (scraping EasyPC or Bermor Techzone to Review Queue, Admin Protected)
app.post("/api/crawl", adminAuth, (req, res) => {
  const store = req.body?.store || "EasyPC";
  const category = req.body?.category || "all";
  const maxPages = req.body?.maxPages || 1;
  const scriptPath = path.join(__dirname, "crawler.js");
  const cmd = `node "${scriptPath}" --store="${store}" --category="${category}" --pages=${maxPages}`;
  exec(cmd, { cwd: __dirname }, (error, stdout, stderr) => {
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
app.post("/api/upload/profile-photo", (req, res) => {
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
      "SELECT id, username, display_name, email, role, avatar_url, passcode, status, last_login, created_at, updated_at FROM admin_accounts ORDER BY id ASC"
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
        passcode || "admin123",
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

app.post("/api/learn/sync-profile", async (req, res) => {
  try {
    const { googleId, email, fullName, photo, institution, unlockedStages } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const gid = googleId || `google-oauth2|${Date.now()}`;
    const name = (fullName || email.split("@")[0] || "Learner").trim();
    const stagesJson = typeof unlockedStages === "object" ? JSON.stringify(unlockedStages) : (unlockedStages || '["build"]');

    await db.query(
      `INSERT INTO google_learner_accounts (google_id, email, full_name, avatar_url, institution, mode, unlocked_stages, last_active)
       VALUES (?, ?, ?, ?, ?, 'learn', ?, CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE 
         full_name = VALUES(full_name),
         avatar_url = COALESCE(VALUES(avatar_url), avatar_url),
         unlocked_stages = COALESCE(VALUES(unlocked_stages), unlocked_stages),
         last_active = CURRENT_TIMESTAMP`,
      [gid, email.trim(), name, photo || null, institution || "Pateros Technological College", stagesJson]
    );

    res.json({ success: true, message: "Google learner profile synchronized." });
  } catch (err) {
    console.error("Sync profile error:", err);
    res.status(500).json({ error: "Failed to sync learner profile" });
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

// ── Team / Content Management APIs ──
app.get("/api/content/team", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM team_members ORDER BY sort_order ASC, id ASC");
    const formatted = rows.map((member) => {
      let key_contributions = [];
      let tech_stack = [];
      let rig_specs = {};
      try {
        key_contributions = typeof member.key_contributions === "string" ? JSON.parse(member.key_contributions) : (member.key_contributions || []);
      } catch (e) {
        key_contributions = member.key_contributions ? [member.key_contributions] : [];
      }
      try {
        tech_stack = typeof member.tech_stack === "string" ? JSON.parse(member.tech_stack) : (member.tech_stack || []);
      } catch (e) {
        tech_stack = member.tech_stack ? [member.tech_stack] : [];
      }
      try {
        rig_specs = typeof member.rig_specs === "string" ? JSON.parse(member.rig_specs) : (member.rig_specs || {});
      } catch (e) {
        rig_specs = {};
      }

      return {
        ...member,
        key_contributions,
        tech_stack,
        rig_specs
      };
    });
    res.json(formatted);
  } catch (err) {
    console.error("Fetch team content error:", err);
    res.status(500).json({ error: "Failed to fetch team content" });
  }
});

app.get("/api/content/team/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM team_members WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Team member not found" });
    const member = rows[0];
    try { member.key_contributions = JSON.parse(member.key_contributions); } catch (_) {}
    try { member.tech_stack = JSON.parse(member.tech_stack); } catch (_) {}
    try { member.rig_specs = JSON.parse(member.rig_specs); } catch (_) {}
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/content/team/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      designation,
      codename,
      role_category,
      avatar_badge,
      photo_url,
      highlight,
      bio,
      key_contributions,
      tech_stack,
      rig_specs,
      fav_tip,
      github,
      linkedin,
      sort_order
    } = req.body;

    const [existing] = await db.query("SELECT id FROM team_members WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: `Member '${id}' not found.` });
    }

    const prepJson = (val) => (typeof val === "object" ? JSON.stringify(val) : (val !== undefined ? val : null));

    await db.query(
      `UPDATE team_members SET
        name = COALESCE(?, name),
        designation = COALESCE(?, designation),
        codename = COALESCE(?, codename),
        role_category = COALESCE(?, role_category),
        avatar_badge = COALESCE(?, avatar_badge),
        photo_url = COALESCE(?, photo_url),
        highlight = COALESCE(?, highlight),
        bio = COALESCE(?, bio),
        key_contributions = COALESCE(?, key_contributions),
        tech_stack = COALESCE(?, tech_stack),
        rig_specs = COALESCE(?, rig_specs),
        fav_tip = COALESCE(?, fav_tip),
        github = COALESCE(?, github),
        linkedin = COALESCE(?, linkedin),
        sort_order = COALESCE(?, sort_order)
       WHERE id = ?`,
      [
        name,
        designation,
        codename,
        role_category,
        avatar_badge,
        photo_url,
        highlight,
        bio,
        prepJson(key_contributions),
        prepJson(tech_stack),
        prepJson(rig_specs),
        fav_tip,
        github,
        linkedin,
        sort_order,
        id
      ]
    );

    res.json({ success: true, message: `Operative profile for ${name || id} synced successfully.` });
  } catch (err) {
    console.error("Update team content error:", err);
    res.status(500).json({ error: "Failed to update team content" });
  }
});

app.post("/api/content/team", adminAuth, async (req, res) => {
  try {
    const {
      id,
      name,
      designation,
      codename,
      role_category,
      avatar_badge,
      photo_url,
      highlight,
      bio,
      key_contributions,
      tech_stack,
      rig_specs,
      fav_tip,
      github,
      linkedin,
      sort_order
    } = req.body;

    const memberId = id || `DEV-${Date.now().toString().slice(-2)}`;
    const prepJson = (val) => (typeof val === "object" ? JSON.stringify(val) : (val || null));

    await db.query(
      `INSERT INTO team_members 
       (id, name, designation, codename, role_category, avatar_badge, photo_url, highlight, bio, key_contributions, tech_stack, rig_specs, fav_tip, github, linkedin, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        memberId,
        name || "New Operative",
        designation || "Developer",
        codename || "OPERATIVE",
        role_category || "core",
        avatar_badge || "DEV",
        photo_url || null,
        highlight || "",
        bio || "",
        prepJson(key_contributions || []),
        prepJson(tech_stack || []),
        prepJson(rig_specs || {}),
        fav_tip || "",
        github || "https://github.com",
        linkedin || "https://linkedin.com",
        sort_order || 99
      ]
    );

    res.json({ success: true, id: memberId, message: "New operative created successfully." });
  } catch (err) {
    console.error("Create team content error:", err);
    res.status(500).json({ error: "Failed to create team member" });
  }
});

app.delete("/api/content/team/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM team_members WHERE id = ?", [id]);
    res.json({ success: true, message: `Operative ${id} removed.` });
  } catch (err) {
    console.error("Delete team content error:", err);
    res.status(500).json({ error: "Failed to delete team member" });
  }
});

// ── Serve Built Frontend (Production SPA) ──
const distPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(distPath));
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(distPath, "index.html"), (err) => {
    if (err) next();
  });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
