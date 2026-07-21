const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password', // Wait, the password is '1234' according to the earlier mysql command? Let's try 1234
    database: 'sleepy'
  });

  const [rows] = await connection.execute('SELECT id, member_id, message, is_read, type, created_at FROM notification ORDER BY created_at DESC LIMIT 5');
  console.log(rows);
  await connection.end();
}

main().catch(console.error);
