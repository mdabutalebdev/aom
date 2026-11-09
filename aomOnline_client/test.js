const fs = require('fs');

async function test() {
  try {
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    
    // We just need a simple POST request with multipart/form-data
    let body = '';
    
    // Name
    body += `--${boundary}\r\nContent-Disposition: form-data; name="name"\r\n\r\nTest Name\r\n`;
    body += `--${boundary}\r\nContent-Disposition: form-data; name="email"\r\n\r\ntest@test.com\r\n`;
    body += `--${boundary}\r\nContent-Disposition: form-data; name="phone"\r\n\r\n01234567890\r\n`;
    body += `--${boundary}\r\nContent-Disposition: form-data; name="cv"; filename="cv.pdf"\r\nContent-Type: application/pdf\r\n\r\ndummy\r\n`;
    body += `--${boundary}\r\nContent-Disposition: form-data; name="media"; filename="media.mp4"\r\nContent-Type: video/mp4\r\n\r\ndummy\r\n`;
    body += `--${boundary}--\r\n`;

    const res = await fetch('http://localhost:5000/api/teacher-applications', {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: body
    });
    
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', data);
  } catch (err) {
    console.error('Fetch Error:', err);
  }
}
test();
