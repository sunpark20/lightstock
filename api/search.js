const fetch = require('node-fetch');

// Base URL for Yahoo Finance API
const BASE_URL = 'https://query1.finance.yahoo.com';

// Handle serverless function request
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get query parameter
    const query = req.query.q;
    
    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    // Yahoo Finance API for searching stocks
    const url = `${BASE_URL}/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`;
    console.log(`Searching stocks with: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract and normalize the search results
    const results = (data.quotes || [])
      .filter(quote => quote.symbol && quote.shortname)
      .map(quote => ({
        symbol: quote.symbol,
        name: quote.shortname || quote.longname || quote.symbol
      }));
    
    // Set cache control headers
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes
    
    // Return the search results
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error searching stocks:', error);
    
    // Fall back to mock data
    return res.status(200).json(getMockSearchResults(req.query.q));
  }
};

// Mock search results for fallback
function getMockSearchResults(query) {
  if (!query || query.length < 2) return [];
  
  const mockResults = {
    'apple': [
      { symbol: 'AAPL', name: 'Apple Inc.' },
      { symbol: 'AAPL.SW', name: 'Apple Inc. (Switzerland)' }
    ],
    'microsoft': [
      { symbol: 'MSFT', name: 'Microsoft Corporation' },
      { symbol: 'MSFT.MX', name: 'Microsoft Corporation (Mexico)' }
    ],
    'google': [
      { symbol: 'GOOGL', name: 'Alphabet Inc. Class A' },
      { symbol: 'GOOG', name: 'Alphabet Inc. Class C' }
    ],
    'amazon': [
      { symbol: 'AMZN', name: 'Amazon.com, Inc.' },
      { symbol: 'AMZN.MX', name: 'Amazon.com, Inc. (Mexico)' }
    ],
    'tesla': [
      { symbol: 'TSLA', name: 'Tesla, Inc.' },
      { symbol: 'TSLA.MX', name: 'Tesla, Inc. (Mexico)' }
    ]
  };
  
  const lowerQuery = query.toLowerCase();
  
  // Check for exact matches
  for (const key in mockResults) {
    if (key.includes(lowerQuery) || lowerQuery.includes(key)) {
      return mockResults[key];
    }
  }
  
  // Return at least one result for any query
  return [
    { symbol: query.toUpperCase(), name: `${query.toUpperCase()} (Mock Data)` }
  ];
}
