const db = require('./backend/config/db');
async function run() {
  try {
    const query = "DELETE FROM pc_parts WHERE LOWER(name) LIKE '%desktop%' OR LOWER(name) LIKE '%thin 15%' OR LOWER(name) LIKE '%pro 15%' OR LOWER(name) LIKE '%bluetti%' OR LOWER(name) LIKE '%solar%' OR LOWER(name) LIKE '%portable%' OR LOWER(name) LIKE '%generator%' OR LOWER(name) LIKE '%power station%' OR LOWER(name) LIKE '%pv130%' OR LOWER(name) LIKE '%ac2p%'";
    const result = await db.query(query);
    console.log('Prebuilts deleted', result);
  } catch(e) {}
  process.exit(0);
}
run();
