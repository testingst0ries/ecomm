const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = process.argv[2] ? parseInt(process.argv[2]) : 3000;
const HTML_FILE = path.join(__dirname, 'index.html');

// Create a simple HTML file if it doesn't exist
if (!fs.existsSync(HTML_FILE)) {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Node.js Server</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.6;
    }
    h1 {
      color: #333;
    }
  </style>
</head>
<body>
  <h1>Hello from Node.js Server!</h1>
  <p>This page is being served by a simple Node.js server without any dependencies.</p>
  <p>Current server time: ${new Date().toLocaleString()}</p>
</body>
</html>
  `;
  
  fs.writeFileSync(HTML_FILE, htmlContent);
  console.log(`Created ${HTML_FILE}`);
}

// Create static directories if they don't exist
const staticDirs = ['css', 'icon', 'images', 'js'];
staticDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
    console.log(`Created directory: ${dirPath}`);
  }
});

// Function to get content type based on file extension
const getContentType = (filePath) => {
  const extname = path.extname(filePath).toLowerCase();
  const contentTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };
  
  return contentTypes[extname] || 'application/octet-stream';
};

// Create HTTP server
const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.url}`);
  
  // Normalize the URL and handle root path
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  
  // Check if path exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    
    // Verify if it's a directory
    fs.stat(filePath, (err, stats) => {
      if (err) {
        res.writeHead(500);
        res.end(`Error: ${err.message}`);
        return;
      }
      
      // If it's a directory, try to serve index.html from that directory
      if (stats.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }
      
      // Read the file
      fs.readFile(filePath, (err, content) => {
        if (err) {
          if (err.code === 'ENOENT') {
            res.writeHead(404);
            res.end('File not found');
          } else {
            res.writeHead(500);
            res.end(`Error loading file: ${err.message}`);
          }
          return;
        }
        
        // Set content type and serve the file
        const contentType = getContentType(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      });
    });
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Serving HTML file: ${HTML_FILE}`);
});