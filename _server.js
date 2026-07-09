const http = require('http');
const fs = require('fs');
const path = require('path');
const root = __dirname;

const mime = {
  '.html':'text/html', '.css':'text/css', '.js':'application/javascript',
  '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg',
  '.webp':'image/webp', '.avif':'image/avif', '.svg':'image/svg+xml',
  '.ico':'image/x-icon', '.woff2':'font/woff2',
};

http.createServer((req, res) => {
  let url = req.url.split('?')[0];
  if (url === '/') url = '/index.html';
  const file = path.join(root, url);
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    const ext = path.extname(file);
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(3000, () => console.log('Server running on port 3000'));
