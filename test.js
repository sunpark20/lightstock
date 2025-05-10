const fetch = require('node-fetch');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_SYMBOL = 'AAPL';
const SEARCH_QUERY = 'Apple';

/**
 * Simple test runner for the API
 */
async function runTests() {
  console.log('🧪 Running LightStock API Tests');
  console.log('================================');
  
  try {
    // Test 1: Health Check
    console.log('\n🔍 Test 1: Health Check');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    if (healthResponse.ok) {
      console.log('✅ Health check passed');
    } else {
      console.error('❌ Health check failed:', await healthResponse.text());
    }
    
    // Test 2: Stock Search
    console.log('\n🔍 Test 2: Stock Search');
    const searchUrl = `${BASE_URL}/api/stock/search/query?q=${encodeURIComponent(SEARCH_QUERY)}`;
    console.log(`Searching for: ${SEARCH_QUERY}`);
    console.log(`URL: ${searchUrl}`);
    
    const searchResponse = await fetch(searchUrl);
    if (searchResponse.ok) {
      const results = await searchResponse.json();
      console.log(`✅ Search returned ${results.length} results`);
      console.log('Sample results:', results.slice(0, 3));
    } else {
      console.error('❌ Search failed:', await searchResponse.text());
    }
    
    // Test 3: Stock Info
    console.log('\n🔍 Test 3: Stock Info');
    const stockUrl = `${BASE_URL}/api/stock/${TEST_SYMBOL}`;
    console.log(`Fetching stock info for: ${TEST_SYMBOL}`);
    console.log(`URL: ${stockUrl}`);
    
    const stockResponse = await fetch(stockUrl);
    if (stockResponse.ok) {
      const stockData = await stockResponse.json();
      console.log('✅ Stock info retrieved successfully');
      console.log('Stock data:', stockData);
    } else {
      console.error('❌ Stock info failed:', await stockResponse.text());
    }
    
    // Test 4: Cache Test
    console.log('\n🔍 Test 4: Cache Test');
    console.log('Making repeated request to test caching...');
    
    const cacheStart = Date.now();
    const cachedResponse = await fetch(stockUrl);
    const cacheTime = Date.now() - cacheStart;
    
    const cacheHeader = cachedResponse.headers.get('X-Cache');
    console.log(`Cache header: ${cacheHeader}`);
    console.log(`Response time: ${cacheTime}ms`);
    
    if (cacheHeader === 'HIT') {
      console.log('✅ Caching is working properly');
    } else {
      console.log('⚠️ Cache miss on second request, might need further testing');
    }
    
    console.log('\n================================');
    console.log('🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Wait for server to be running before testing
console.log('⏳ Please make sure the server is running on port 3000 before running this test.');
console.log('   Start the server with: npm start');
console.log('\nPress any key to start the tests...');

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', () => {
  process.stdin.setRawMode(false);
  runTests();
});
