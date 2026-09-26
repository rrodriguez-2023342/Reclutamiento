const axios = require('axios');

async function test() {
  try {
    const login = await axios.post('http://localhost:4000/api/auth/login', {
      usuario: 'adminreclutamientoDHI@gmail.com',
      password: 'ReclutamientoDHISOL$'
    });
    console.log('Login:', login.data);
    const token = login.data.token;
    
    const res = await axios.get('http://localhost:4000/api/empresas/divisiones?page=1&limit=6', {
      headers: { Authorization: 'Bearer ' + token }
    });
    console.log('Divisiones:', JSON.stringify(res.data, null, 2));
  } catch (e) {
    console.error('Error:', e.response?.data || e.message);
    if (e.response) {
      console.log('Status:', e.response.status);
      console.log('Data:', e.response.data);
    }
  }
}
test();