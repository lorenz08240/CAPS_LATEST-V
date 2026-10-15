require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());

// API to get all parts grouped by category
app.get("/api/parts", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM pc_parts");
    const componentsData = {};
    rows.forEach(row => {
      if (!componentsData[row.category]) {
        componentsData[row.category] = [];
      }
      
      // Map the DB row to the frontend format
      const item = { ...row };
      // The column in DB is already `desc`, so row.desc has the data.
      // Ensure strings are not null to prevent frontend crashes:
      item.desc = item.desc || "";
      item.name = item.name || "";
      item.brand = item.brand || "";

      if (typeof item.tags === 'string') {
        try { item.tags = JSON.parse(item.tags); } catch(e) {}
      }

      componentsData[row.category].push(item);
    });
    res.json(componentsData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API to get parts by category
app.get("/api/parts/:category", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM pc_parts WHERE category = ?", [
      req.params.category,
    ]);
    res.json(rows.map(row => {
      const item = { ...row };
      item.desc = item.desc || "";
      item.name = item.name || "";
      item.brand = item.brand || "";
      if (typeof item.tags === 'string') {
        try { item.tags = JSON.parse(item.tags); } catch(e) {}
      }
      return item;
    }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// API to insert or update a part
app.post("/api/parts", async (req, res) => {
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
      category=VALUES(category), img=VALUES(img), brand=VALUES(brand), name=VALUES(name), \`desc\`=VALUES(\`desc\`), price=VALUES(price), tags=VALUES(tags),
      socket_type=VALUES(socket_type), ddr_type=VALUES(ddr_type), form_factor=VALUES(form_factor), power_required=VALUES(power_required),
      wattage=VALUES(wattage), capacity=VALUES(capacity), speed=VALUES(speed), type=VALUES(type), efficiency=VALUES(efficiency)
    `;

    const values = [
      id, category, img || null, brand || null, name || null, desc || null, price || null, tagsJson,
      socket_type || null, ddr_type || null, form_factor || null, power_required || null,
      wattage || null, capacity || null, speed || null, type || null, efficiency || null
    ];

    await db.query(query, values);
    res.json({ success: true, message: "Part added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
});

// API to delete a part
app.delete("/api/parts/:id", async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM pc_parts WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Component not found" });
    }
    res.json({ success: true, message: "Component deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API to update a part
app.put("/api/parts/:id", async (req, res) => {
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
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ success: false, dbConnected: false, error: err.message });
  }
});

// Admin database sanitization endpoint (Clean noisy crawler data)
app.post("/api/admin/clean-db", async (req, res) => {
  try {
    const queries = [
      "DELETE FROM pc_parts WHERE LOWER(name) LIKE '%laptop%' OR LOWER(name) LIKE '%notebook%' OR LOWER(name) LIKE '%vivobook%' OR LOWER(name) LIKE '%ideapad%' OR LOWER(name) LIKE '%aspire%' OR LOWER(name) LIKE '%nitro%' OR LOWER(name) LIKE '%cyborg%' OR LOWER(name) LIKE '%modern 14%' OR LOWER(name) LIKE '%zenbook%' OR LOWER(name) LIKE '%macbook%' OR LOWER(name) LIKE '%thinkpad%' OR LOWER(name) LIKE '%fhd ips%' OR LOWER(name) LIKE '%14.0\"%' OR LOWER(name) LIKE '%15.6\"%'",
      "DELETE FROM pc_parts WHERE (category = 'cpu' AND (LOWER(name) LIKE '%desktop pc%' OR LOWER(name) LIKE '%gaming desktop%' OR LOWER(name) LIKE '%thin 15%' OR LOWER(name) LIKE '%ldc 15250%' OR LOWER(name) LIKE '%musetex%'))",
      "DELETE FROM pc_parts WHERE (category = 'psu' AND (LOWER(name) LIKE '%bluetti%' OR LOWER(name) LIKE '%solar%' OR LOWER(name) LIKE '%portable%' OR LOWER(name) LIKE '%generator%' OR LOWER(name) LIKE '%power station%' OR LOWER(name) LIKE '%pv130%' OR LOWER(name) LIKE '%ac2p%'))",
      "DELETE FROM pc_parts WHERE LOWER(name) LIKE '%cooler%' AND category = 'cpu'"
    ];

    let totalDeleted = 0;
    for (const q of queries) {
      const [res] = await db.query(q);
      totalDeleted += res.affectedRows || 0;
    }

    res.json({
      success: true,
      message: `Database cleaned: ${totalDeleted} invalid/miscategorized items removed.`,
      deletedCount: totalDeleted
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ status: "healthy", database: "connected" });
  } catch (err) {
    res.status(503).json({ status: "degraded", database: "disconnected", error: err.message });
  }
});

// API to trigger crawler
const { exec } = require("child_process");
app.post("/api/crawl", (req, res) => {
  exec("node crawler.js", (error, stdout, stderr) => {
    if (error) {
      console.error(`Crawler execution error: ${error.message}`);
      return res.status(500).json({ error: error.message, stderr });
    }
    res.json({ success: true, message: "Crawling completed successfully", output: stdout });
  });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
