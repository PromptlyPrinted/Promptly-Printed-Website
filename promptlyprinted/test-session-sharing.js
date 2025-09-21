#!/usr/bin/env node

// Test script to verify session sharing between apps through proxy
const http = require('http');
const querystring = require('querystring');

async function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const cookies = res.headers['set-cookie'] || [];
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body,
          cookies
        });
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function testSessionSharing() {
  console.log('🧪 Testing session sharing between apps...\n');

  // Test 1: Check if /orders redirects to sign-in (no session)
  console.log('1️⃣ Testing /orders without session (should redirect to sign-in)');
  try {
    const ordersReq = await makeRequest({
      hostname: 'localhost',
      port: 8888,
      path: '/orders',
      method: 'GET',
      headers: {
        'User-Agent': 'test-script'
      }
    });

    console.log(`   Status: ${ordersReq.statusCode}`);
    console.log(`   Redirected: ${ordersReq.statusCode === 302 || ordersReq.statusCode === 307}`);
    if (ordersReq.headers.location) {
      console.log(`   Location: ${ordersReq.headers.location}`);
    }
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }

  console.log('\n2️⃣ Testing sign-in page accessibility');
  try {
    const signInReq = await makeRequest({
      hostname: 'localhost',
      port: 8888,
      path: '/sign-in',
      method: 'GET',
      headers: {
        'User-Agent': 'test-script'
      }
    });

    console.log(`   Status: ${signInReq.statusCode}`);
    console.log(`   Sign-in page accessible: ${signInReq.statusCode === 200}`);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }

  console.log('\n3️⃣ Testing auth API endpoint');
  try {
    const authReq = await makeRequest({
      hostname: 'localhost',
      port: 8888,
      path: '/api/auth/get-session',
      method: 'GET',
      headers: {
        'User-Agent': 'test-script'
      }
    });

    console.log(`   Status: ${authReq.statusCode}`);
    console.log(`   Auth API accessible: ${authReq.statusCode === 200}`);

    // Try to parse the response as JSON
    try {
      const sessionData = JSON.parse(authReq.body);
      console.log(`   Session data:`, sessionData);
    } catch (e) {
      console.log(`   Response (first 200 chars): ${authReq.body.substring(0, 200)}`);
    }
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }

  console.log('\n4️⃣ Testing direct port access (apps/web on 3001)');
  try {
    const directReq = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/orders',
      method: 'GET',
      headers: {
        'User-Agent': 'test-script'
      }
    });

    console.log(`   Status: ${directReq.statusCode}`);
    console.log(`   Direct access works: ${directReq.statusCode === 200 || directReq.statusCode === 302 || directReq.statusCode === 307}`);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }

  console.log('\n5️⃣ Testing admin app access (apps/app on 3000)');
  try {
    const adminReq = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/admin',
      method: 'GET',
      headers: {
        'User-Agent': 'test-script'
      }
    });

    console.log(`   Status: ${adminReq.statusCode}`);
    console.log(`   Admin app works: ${adminReq.statusCode === 200 || adminReq.statusCode === 302 || adminReq.statusCode === 307}`);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }

  console.log('\n✅ Test completed');
}

testSessionSharing().catch(console.error);