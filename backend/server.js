require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const db = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());

// ── Admin Authentication Middleware ──
const adminAuth = (req, res, next) => {
  const adminKey = req.headers["x-admin-key"] || req.query.admin_key;
  const expectedKey = process.env.ADMIN_API_KEY || "admin123";

  if (!adminKey || adminKey !== expectedKey) {
    return res.status(401).json({ error: "Unauthorized: Admin authorization required" });
  }
  next();
};

// API to get all parts grouped by category
app.get("/api/parts", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM pc_parts ORDER BY id DESC");
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

// API to get parts by category
app.get("/api/parts/:category", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM pc_parts WHERE category = ? ORDER BY id DESC", [
      req.params.category,
    ]);
    res.json(rows.map(row => {
      const item = { ...row };
      item.desc = item.desc || "";
      item.name = item.name || "";
      item.brand = item.brand || "";
      item.created_at = item.created_at || new Date().toISOString();
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
    res.json({ success: true, message: "Part created/updated successfully" });
  } catch (err) {
    console.error("POST /api/parts error:", err);
    res.status(500).json({ error: "Failed to save component" });
  }
});

// API to delete a part (Admin Protected, with 404 validation)
app.delete("/api/parts/:id", adminAuth, async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM pc_parts WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Component not found" });
    }
    res.json({ success: true, message: "Component deleted successfully" });
  } catch (err) {
    console.error(`DELETE /api/parts/${req.params.id} error:`, err);
    res.status(500).json({ error: "Failed to delete component" });
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

// ══════════════════════════════════════════
// SCRAPED DATA REVIEW QUEUE ENDPOINTS
// ══════════════════════════════════════════

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
      let prodId = item.id.startsWith("easypc-") ? item.id : `prod-${item.id}`;
      const [existingPart] = await db.query("SELECT id FROM pc_parts WHERE id = ?", [prodId]);
      if (existingPart && existingPart.length > 0) {
        prodId = `${prodId}-${Date.now().toString().slice(-4)}`;
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
  const cmd = `node crawler.js --store="${store}" --category="${category}" --pages=${maxPages}`;
  exec(cmd, (error, stdout, stderr) => {
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

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
