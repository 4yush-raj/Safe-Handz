const http = require('http');

const loginData = JSON.stringify({
  email: 'testcustomer@example.com',
  password: 'Password123'
});

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log("Login Status:", res.statusCode);
    console.log("Login Response:", body);
    try {
      const json = JSON.parse(body);
      if (json.token) {
        fetchDoc(json.token);
      }
    } catch(e) {
      console.error("Login parsing error:", e);
    }
  });
});

req.on('error', (e) => {
  console.error("Login request error:", e);
});

req.write(loginData);
req.end();

function fetchDoc(token) {
  const req2 = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/documents/d27b21c8-826f-4773-b531-eea4ec078922/download',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }, (res) => {
    console.log("Download Response Status:", res.statusCode);
    console.log("Download Headers:", res.headers);
    let chunks = [];
    res.on('data', chunk => chunks.push(chunk));
    res.on('end', () => {
      const buf = Buffer.concat(chunks);
      console.log("Downloaded body length:", buf.length);
      if (buf.length < 500) {
        console.log("Downloaded body content:", buf.toString('utf-8'));
      } else {
        console.log("Downloaded body start:", buf.slice(0, 100).toString('hex'));
      }
    });
  });
  req2.on('error', (e) => {
    console.error("Download request error:", e);
  });
  req2.end();
}
