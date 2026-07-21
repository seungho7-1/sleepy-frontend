const axios = require('axios');

async function main() {
  try {
    const loginRes = await axios.post('http://localhost:8383/api/auth/login', { username: 'testuser', password: 'password123' })
      .catch(e => {
        return axios.post('http://localhost:8383/api/auth/signup', { username: 'testuser', password: 'password123', nickname: 'TestUser', email: 'test@test.com' })
          .then(() => axios.post('http://localhost:8383/api/auth/login', { username: 'testuser', password: 'password123' }));
      });
      
    const token = loginRes.data.token || loginRes.data.accessToken;
    
    const notifRes = await axios.get('http://localhost:8383/api/notifications', {
      headers: { Authorization: 'Bearer ' + token }
    });
    console.log(JSON.stringify(notifRes.data, null, 2));
  } catch(e) {
    console.error(e.response ? e.response.data : e.message);
  }
}
main();
