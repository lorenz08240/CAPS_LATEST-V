const db = require('./backend/config/db');
async function run() {
  try {
    const result = await db.query("DELETE FROM pc_parts WHERE LOWER(name) LIKE '%laptop%' OR LOWER(name) LIKE '%vivobook%' OR LOWER(name) LIKE '%ideapad%' OR LOWER(name) LIKE '%aspire%' OR LOWER(name) LIKE '%nitro%' OR LOWER(name) LIKE '%gaming a16%'");
    console.log('Laptops deleted from DB', result);
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}
run();
