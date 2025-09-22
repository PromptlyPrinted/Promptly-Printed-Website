#!/usr/bin/env node

const http = require('http');
const url = require('url');

// Helper function to check if a file exists on a server
function checkFileExists(hostname, port, path) {
  return new Promise((resolve) => {
    const options = {
      hostname,
      port,
      path,
      method: 'HEAD',
      timeout: 1000 // 1 second timeout
    };

    const req = http.request(options, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

function proxyRequest(req, res, targetPort) {
  const options = {
    hostname: 'localhost',
    port: targetPort,
    path: req.url,
    method: req.method,
    headers: req.headers
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Proxy error');
  });

  req.pipe(proxyReq);
}

// Dynamic routing for static assets
async function routeStaticAsset(req, res) {
  const path = req.url;

  // First check admin app (port 3000)
  const existsOnAdmin = await checkFileExists('localhost', 3000, path);
  if (existsOnAdmin) {
    console.log(`  -> Routing to admin app (port 3000) [file exists on admin]`);
    proxyRequest(req, res, 3000);
    return;
  }

  // Then check web app (port 3001)
  const existsOnWeb = await checkFileExists('localhost', 3001, path);
  if (existsOnWeb) {
    console.log(`  -> Routing to web app (port 3001) [file exists on web]`);
    proxyRequest(req, res, 3001);
    return;
  }

  // Default to admin app if not found on either (for better error handling)
  console.log(`  -> Routing to admin app (port 3000) [default - file not found on either server]`);
  proxyRequest(req, res, 3000);
}

const server = http.createServer(async (req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

  let targetPort;
  const referer = req.headers.referer;

  // Route based on URL path
  if (req.url.startsWith('/admin') ||
      req.url.startsWith('/sign-in') ||
      req.url.startsWith('/sign-up')) {
    targetPort = 3000;
    console.log(`  -> Routing to admin app (port 3000)`);
  }
  // Route auth API calls based on context/referer
  else if (req.url.startsWith('/api/auth/')) {
    // If the request is coming from a sign-in or admin context, route to admin app
    if (referer && (referer.includes('/admin') || referer.includes('/sign-in') || referer.includes('/sign-up'))) {
      targetPort = 3000;
      console.log(`  -> Routing auth API to admin app (port 3000) [context: admin/auth]`);
    } else {
      // Default to admin app for auth APIs to ensure session consistency
      targetPort = 3000;
      console.log(`  -> Routing auth API to admin app (port 3000) [default for auth consistency]`);
    }
  }
  // Route static assets using dynamic checking
  else if (req.url.startsWith('/_next/')) {
    await routeStaticAsset(req, res);
    return;
  }
  else {
    targetPort = 3001;
    console.log(`  -> Routing to web app (port 3001)`);
  }

  proxyRequest(req, res, targetPort);
});

const PORT = 8888;
server.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
  console.log('📋 Routing:');
  console.log('  • /api/auth/* → localhost:3000 (admin)');
  console.log('  • /admin*     → localhost:3000 (admin)');
  console.log('  • /sign-in*   → localhost:3000 (admin)');
  console.log('  • /sign-up*   → localhost:3000 (admin)');
  console.log('  • /*          → localhost:3001 (web)');
  console.log('');
  console.log('🔐 Session sharing enabled! Login on one app works on both.');
});