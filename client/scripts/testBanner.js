const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

async function main() {
  try {
    const loginResp = await axios.post('http://localhost:8000/admin/login', {
      name: 'admin',
      password: 'admin123',
    });

    const token = loginResp.headers.token;
    if (!token) {
      console.error('Login succeeded but no token header was returned');
      process.exit(1);
    }

    console.log('Token:', token);

    const form = new FormData();
    const filePath = path.resolve(__dirname, '../public/logo192.png');
    form.append('img', fs.createReadStream(filePath));
    form.append('alt', 'banner');

    const response = await axios.post('http://localhost:8000/admin/addBanner', form, {
      headers: {
        ...form.getHeaders(),
        token,
      },
    });

    console.log('Add banner response:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    } else {
      console.error('Request error:', error.message);
    }
    process.exit(1);
  }
}

main();


