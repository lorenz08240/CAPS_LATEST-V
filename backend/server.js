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

// API to delete a part
app.delete("/api/parts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM pc_parts WHERE id = ?", [id]);
    res.json({ success: true, message: "Part deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API to update a part
app.put("/api/parts/:id", async (req, res) => {
  try {
    const { id } = req.params;
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
      id
    ];

    await db.query(query, values);
    res.json({ success: true, message: "Part updated successfully" });
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

// ==========================================
// SCRAPED DATA REVIEW QUEUE ENDPOINTS
// ==========================================
const initScrapedQueueTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS scraped_queue (
        id VARCHAR(255) PRIMARY KEY,
        source VARCHAR(100) DEFAULT 'Source: EasyPC',
        source_name VARCHAR(100) DEFAULT 'EasyPC',
        date VARCHAR(50),
        scraped_name TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'case',
        brand VARCHAR(100),
        form_factor VARCHAR(50),
        socket_type VARCHAR(50),
        ddr_type VARCHAR(50),
        wattage VARCHAR(50),
        power_required VARCHAR(50),
        capacity VARCHAR(50),
        speed VARCHAR(50),
        type VARCHAR(50),
        efficiency VARCHAR(50),
        price VARCHAR(50),
        img TEXT,
        \`desc\` TEXT,
        tags TEXT,
        approved TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed initial EasyPC items if queue is empty
    const [existing] = await db.query("SELECT COUNT(*) as cnt FROM scraped_queue");
    if (existing[0]?.cnt === 0) {
      const initialEasyPC = [
        ["easypc-c500", "1) Source: EasyPC", "EasyPC", "2023-03-11", "GIGABYTE AORUS C500 GLASS Micro ATX Case", "case", "GIGABYTE", "Micro ATX", null, null, null, "₱6,450", "/pcbackground.png", "Scraped from EasyPC via BuildLab Crawler", JSON.stringify(["scraped", "case", "easypc"]), 0],
        ["easypc-2300x", "2) Source: EasyPC", "EasyPC", "2024-03-14", "GIGABYTE AORUS 2300X ATX Tower", "case", "GIGABYTE", "ATX", null, null, null, "₱5,200", "/pcbackground.png", "Scraped from EasyPC via BuildLab Crawler", JSON.stringify(["scraped", "case", "easypc"]), 0],
        ["easypc-psu-bundle", "3) Source: EasyPC", "EasyPC", "2023-03-13", "GIGABYTE GP-P750GM 750W 80+ Gold Power Supply", "psu", "GIGABYTE", null, null, null, "750", "₱4,850", "/pcbackground.png", "Scraped from EasyPC via BuildLab Crawler", JSON.stringify(["scraped", "psu", "easypc"]), 0],
        ["easypc-ssd-1tb", "4) Source: EasyPC", "EasyPC", "2024-03-13", "GIGABYTE AORUS Gen4 7300 SSD 1TB NVMe M.2", "storage", "GIGABYTE", null, null, null, null, "₱4,590", "/pcbackground.png", "Scraped from EasyPC via BuildLab Crawler", JSON.stringify(["scraped", "storage", "easypc"]), 0]
      ];

      for (const row of initialEasyPC) {
        await db.query(`
          INSERT IGNORE INTO scraped_queue 
          (id, source, source_name, date, scraped_name, category, brand, form_factor, socket_type, ddr_type, wattage, price, img, \`desc\`, tags, approved)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, row);
      }
    }
  } catch (err) {
    console.error("Scraped queue table check error:", err.message);
  }
};
initScrapedQueueTable();

// API to get all queued scraped items
app.get("/api/scraped-queue", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM scraped_queue ORDER BY created_at DESC");
    res.json(rows.map(row => ({
      ...row,
      tags: typeof row.tags === 'string' ? JSON.parse(row.tags || "[]") : (row.tags || []),
      approved: Boolean(row.approved)
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API to toggle approval of a scraped item
app.post("/api/scraped-queue/approve/:id", async (req, res) => {
  try {
    await db.query("UPDATE scraped_queue SET approved = NOT approved WHERE id = ?", [req.params.id]);
    const [updated] = await db.query("SELECT * FROM scraped_queue WHERE id = ?", [req.params.id]);
    res.json({ success: true, item: updated[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API to discard / delete a scraped item from the review queue
app.delete("/api/scraped-queue/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM scraped_queue WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Scraped component discarded from queue." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API to merge all approved scraped items into production pc_parts table
app.post("/api/scraped-queue/merge", async (req, res) => {
  try {
    const [approvedItems] = await db.query("SELECT * FROM scraped_queue WHERE approved = 1");
    if (!approvedItems || approvedItems.length === 0) {
      return res.status(400).json({ error: "No items are approved for merging." });
    }

    let mergedCount = 0;
    for (const item of approvedItems) {
      const prodId = item.id.startsWith("easypc-") ? item.id : `prod-${item.id}`;
      const query = `
        INSERT INTO pc_parts 
        (id, category, img, brand, name, \`desc\`, price, tags, socket_type, ddr_type, form_factor, power_required, wattage, capacity, speed, type, efficiency) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        category=VALUES(category), img=VALUES(img), brand=VALUES(brand), name=VALUES(name), \`desc\`=VALUES(\`desc\`),
        price=VALUES(price), tags=VALUES(tags), socket_type=VALUES(socket_type), ddr_type=VALUES(ddr_type),
        form_factor=VALUES(form_factor), wattage=VALUES(wattage)
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

    // Delete merged items from queue
    await db.query("DELETE FROM scraped_queue WHERE approved = 1");

    res.json({
      success: true,
      mergedCount,
      message: `Successfully verified and merged ${mergedCount} item(s) from EasyPC into production inventory!`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API to trigger crawler (scraping EasyPC to Review Queue)
const { exec } = require("child_process");
app.post("/api/crawl", (req, res) => {
  exec("node crawler.js", (error, stdout, stderr) => {
    if (error) {
      console.error(`Crawler execution error: ${error.message}`);
      return res.status(500).json({ error: error.message, stderr });
    }
    res.json({ success: true, message: "EasyPC Crawling completed. Components placed into Scraped Data Review Queue.", output: stdout });
  });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
