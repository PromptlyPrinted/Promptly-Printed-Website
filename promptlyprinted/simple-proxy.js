#!/usr/bin/env node

const http = require('http');
const url = require('url');

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

const server = http.createServer((req, res) => {
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
      // Otherwise, route to web app for web app pages
      targetPort = 3001;
      console.log(`  -> Routing auth API to web app (port 3001) [context: web]`);
    }
  }
  // Route static assets based on referer and asset patterns
  else if (req.url.startsWith('/_next/')) {
    // Check if this is a direct navigation to sign-in or admin
    const origin = req.headers.origin || `http://localhost:8888`;
    const fullReferer = referer || '';

    if (fullReferer.includes('/admin') ||
        fullReferer.includes('/sign-in') ||
        fullReferer.includes('/sign-up') ||
        fullReferer.includes(':8888/admin') ||
        fullReferer.includes(':8888/sign-in') ||
        fullReferer.includes(':8888/sign-up')) {
      targetPort = 3000;
      console.log(`  -> Routing to admin app (port 3000) [static asset from admin, referer: ${fullReferer}]`);
    } else if (fullReferer &&
               !fullReferer.includes('/admin') &&
               !fullReferer.includes('/sign-in') &&
               !fullReferer.includes('/sign-up')) {
      targetPort = 3001;
      console.log(`  -> Routing to web app (port 3001) [static asset from web, referer: ${fullReferer}]`);
    } else {
      // When referer is unclear, analyze the asset path to determine which app it belongs to
      // Decode URL to handle encoded characters like %5B and %5D
      const decodedUrl = decodeURIComponent(req.url);

      // Admin app specific patterns
      if (decodedUrl.includes('apps_app') ||
          decodedUrl.includes('authenticated') ||
          decodedUrl.includes('admin') ||
          decodedUrl.includes('__61ce41') ||  // Admin app specific chunk
          decodedUrl.includes('_063ab7') ||   // Admin app icon
          decodedUrl.includes('__1d4c5d') ||  // Admin app specific chunk
          decodedUrl.includes('__cffd3f') ||  // Admin app specific chunk
          decodedUrl.includes('_b16ee7') ||   // Admin app specific chunk
          decodedUrl.includes('__0678eb') ||  // Admin app specific chunk
          decodedUrl.includes('__a4e8ed') ||  // Admin app specific chunk
          decodedUrl.includes('_635ecd') ||   // Admin app specific chunk
          decodedUrl.includes('__67441e') ||  // Admin app specific CSS
          decodedUrl.includes('[root of the server]__67441e') ||  // Handle decoded version
          decodedUrl.includes('(unauthenticated)') ||  // Sign-in page assets
          decodedUrl.includes('__75d270') ||  // Admin app specific chunk
          decodedUrl.includes('__744cf3') ||  // Admin app specific chunk
          decodedUrl.includes('_af2195') ||   // Admin app specific chunk
          decodedUrl.includes('9dd9d8')) {  // Sign-in page specific chunk
        targetPort = 3000;
        console.log(`  -> Routing to admin app (port 3000) [static asset pattern match: ${decodedUrl}]`);
      } else if (decodedUrl.includes('apps_web') ||
                 decodedUrl.includes('(home)') ||
                 decodedUrl.includes('__2e7fab') ||  // Web app specific chunk
                 decodedUrl.includes('_cbb84b') ||   // Web app icon
                 decodedUrl.includes('__2f5eec') ||  // Web app specific chunk
                 decodedUrl.includes('__83ce3d') ||  // Web app specific chunk
                 decodedUrl.includes('_44c4d9') ||   // Web app specific chunk
                 decodedUrl.includes('__f72137') ||  // Web app specific chunk
                 decodedUrl.includes('_123ae5') ||   // Web app specific chunk
                 decodedUrl.includes('__05dc44') ||  // Web app specific CSS
                 decodedUrl.includes('[root of the server]__05dc44')) {  // Handle decoded version
        targetPort = 3001;
        console.log(`  -> Routing to web app (port 3001) [static asset pattern match: ${decodedUrl}]`);
      } else {
        // For unclear assets, check the most recent page request to determine context
        // If the last main page request was /sign-in or /admin, route to admin app
        targetPort = 3001; // Default to web app as it's the public-facing app
        console.log(`  -> Routing to web app (port 3001) [static asset default: ${decodedUrl}]`);
      }
    }
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