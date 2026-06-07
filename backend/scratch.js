const db = require("./config/db");

async function check() {
  try {
    const [tables] = await db.query("SHOW TABLES");
    console.log("Tables:", tables);
    const [cols] = await db.query("DESCRIBE pc_parts");
    console.log("Columns:", cols);
    const [rows] = await db.query("SELECT * FROM pc_parts LIMIT 2");
    console.log("Rows:", rows);
  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    process.exit(0);
  }
}
check();
