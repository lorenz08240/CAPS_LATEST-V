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

// ── Serve Built Frontend (Production SPA) ──
const path = require("path");
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
