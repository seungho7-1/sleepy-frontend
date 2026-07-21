const mysql = require('mysql2/promise');
async function main() {
  try {
    const conn = await mysql.createConnection({ host: 'localhost', user: 'root', password: 'Ap513147!', database: 'sleepy' });
    const [rows] = await conn.execute('SELECT id, type, message, related_url, is_read FROM notification ORDER BY id DESC LIMIT 5;');
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch(e) {
    console.error(e);
  }
}
main();
