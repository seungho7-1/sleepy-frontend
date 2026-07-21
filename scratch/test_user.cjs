const mysql = require('mysql2/promise');
const axios = require('axios');

async function main() {
  const conn = await mysql.createConnection({ host: 'localhost', user: 'root', password: 'Ap513147!', database: 'sleepy' });
  
  // Find the user who received the last notification
  const [notifs] = await conn.execute('SELECT member_id FROM notification ORDER BY id DESC LIMIT 1');
  if (notifs.length === 0) return console.log('No notifications');
  
  const memberId = notifs[0].member_id;
  
  // Find that user's username
  const [users] = await conn.execute('SELECT username FROM member WHERE id = ?', [memberId]);
  if (users.length === 0) return console.log('User not found');
  
  const username = users[0].username;
  console.log('Testing with user:', username);
  
  // Login as that user (assuming password is the same as username or test1234!, or we can just mock the token if we can't guess the password)
  // We don't know the password. Let's just create a mock JWT token if it's using a known secret? No.
  
  // Let's just use curl to the backend to get a 401 if we don't have token.
  // We can't hit the API without the password.
  console.log("Cannot test API without user password.");
  process.exit(0);
}
main();
