const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

async function run() {
  try {
    console.log("1. Logging in as Admin...");
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@beautybeats.in',
      password: 'Admin@123'
    });
    
    const token = loginRes.data.token;
    console.log("Logged in successfully! Token received.");

    console.log("2. Preparing PUT request...");
    const filePath = "C:\\Users\\cypat\\.gemini\\antigravity-ide\\brain\\925bd0dc-8627-4741-9e17-05a2bd585aae\\gdrive_media\\IMG_5453.MOV";
    const fileStream = fs.createReadStream(filePath);

    const form = new FormData();
    form.append('title', 'Redefine Your');
    form.append('subtitle', 'Natural Glow');
    form.append('type', 'HERO_SLIDE');
    form.append('branch', 'SALON');
    form.append('order', '0');
    form.append('isActive', 'true');
    form.append('image', fileStream, 'IMG_5453.MOV');

    console.log("3. Sending PUT request to http://localhost:5000/api/website-content/6a5a77f0064e8fbb7204feec...");
    const putRes = await axios.put('http://localhost:5000/api/website-content/6a5a77f0064e8fbb7204feec', form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${token}`
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    console.log("PUT RESPONSE:", putRes.data);
  } catch (error) {
    if (error.response) {
      console.error("API ERROR:", error.response.status, error.response.data);
    } else {
      console.error("ERROR:", error.message);
    }
  }
}

run();
