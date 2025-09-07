// Test if the CMS route is working at all
async function testCMSRoute() {
  try {
    console.log('Testing CMS route...');
    
    // Test GET request to categories
    const response = await fetch('http://localhost:3000/api/cms/blog/categories', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('GET /api/cms/blog/categories');
    console.log('Status:', response.status);
    console.log('Response:', await response.text());
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testCMSRoute();