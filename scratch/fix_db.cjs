const mysql = require('mysql2/promise');

async function main() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Ap513147!',
      database: 'sleepy'
    });
    
    // Update null related_urls to point to post 2989
    const [result] = await conn.execute("UPDATE notification SET related_url = '/community/2989#comment-45' WHERE related_url IS NULL");
    console.log(`Fixed DB: updated ${result.affectedRows} rows.`);
    
    // Check what we have
    const [rows] = await conn.execute("SELECT id, related_url FROM notification LIMIT 5");
    console.log(rows);
    
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
main();
