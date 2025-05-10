/**
 * Mock stock data for testing when API is unavailable
 */

// Common popular stocks
const stockData = {
  'AAPL': {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    price: 182.33,
    currency: 'USD',
    change: -0.85,
    changePercent: -0.46,
    dayHigh: 183.69,
    dayLow: 180.44,
    updatedAt: '2025-05-09T20:00:00.000Z',
    isMarketClosed: true,
    lastTradingDate: '2025-05-09'
  },
  'MSFT': {
    ticker: 'MSFT',
    name: 'Microsoft Corporation',
    price: 415.56,
    currency: 'USD',
    change: 2.74,
    changePercent: 0.66,
    dayHigh: 416.78,
    dayLow: 412.03,
    updatedAt: '2025-05-09T20:00:00.000Z',
    isMarketClosed: true,
    lastTradingDate: '2025-05-09'
  },
  'GOOGL': {
    ticker: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 170.35,
    currency: 'USD',
    change: 0.78,
    changePercent: 0.46,
    dayHigh: 171.19,
    dayLow: 168.72,
    updatedAt: '2025-05-09T20:00:00.000Z',
    isMarketClosed: true,
    lastTradingDate: '2025-05-09'
  },
  'AMZN': {
    ticker: 'AMZN',
    name: 'Amazon.com, Inc.',
    price: 182.68,
    currency: 'USD',
    change: 0.45,
    changePercent: 0.25,
    dayHigh: 183.95,
    dayLow: 181.33,
    updatedAt: '2025-05-09T20:00:00.000Z',
    isMarketClosed: true,
    lastTradingDate: '2025-05-09'
  },
  'TSLA': {
    ticker: 'TSLA',
    name: 'Tesla, Inc.',
    price: 175.33,
    currency: 'USD',
    change: -3.28,
    changePercent: -1.83,
    dayHigh: 179.45,
    dayLow: 174.01,
    updatedAt: '2025-05-09T20:00:00.000Z',
    isMarketClosed: true,
    lastTradingDate: '2025-05-09'
  },
  'META': {
    ticker: 'META',
    name: 'Meta Platforms, Inc.',
    price: 473.32,
    currency: 'USD',
    change: 2.15,
    changePercent: 0.46,
    dayHigh: 475.64,
    dayLow: 468.91,
    updatedAt: '2025-05-09T20:00:00.000Z',
    isMarketClosed: true,
    lastTradingDate: '2025-05-09'
  },
  'NFLX': {
    ticker: 'NFLX',
    name: 'Netflix, Inc.',
    price: 589.98,
    currency: 'USD',
    change: 3.45,
    changePercent: 0.59,
    dayHigh: 592.40,
    dayLow: 586.10,
    updatedAt: '2025-05-09T20:00:00.000Z',
    isMarketClosed: true,
    lastTradingDate: '2025-05-09'
  },
  'NVDA': {
    ticker: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 924.79,
    currency: 'USD',
    change: 15.32,
    changePercent: 1.69,
    dayHigh: 928.50,
    dayLow: 911.44,
    updatedAt: '2025-05-09T20:00:00.000Z',
    isMarketClosed: true,
    lastTradingDate: '2025-05-09'
  },
  'JPM': {
    ticker: 'JPM',
    name: 'JPMorgan Chase & Co.',
    price: 193.76,
    currency: 'USD',
    change: 0.32,
    changePercent: 0.17,
    dayHigh: 194.85,
    dayLow: 192.33,
    updatedAt: '2025-05-09T20:00:00.000Z',
    isMarketClosed: true,
    lastTradingDate: '2025-05-09'
  },
  'V': {
    ticker: 'V',
    name: 'Visa Inc.',
    price: 273.15,
    currency: 'USD',
    change: 1.25,
    changePercent: 0.46,
    dayHigh: 274.29,
    dayLow: 271.88,
    updatedAt: '2025-05-09T20:00:00.000Z',
    isMarketClosed: true,
    lastTradingDate: '2025-05-09'
  }
};

// Search results for common search terms
const searchResults = {
  'apple': [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'AAPL.SW', name: 'Apple Inc. (Switzerland)' },
    { symbol: 'AAPL.MX', name: 'Apple Inc. (Mexico)' }
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
  ],
  'meta': [
    { symbol: 'META', name: 'Meta Platforms, Inc.' },
    { symbol: 'META.MX', name: 'Meta Platforms, Inc. (Mexico)' }
  ],
  'netflix': [
    { symbol: 'NFLX', name: 'Netflix, Inc.' },
    { symbol: 'NFLX.MX', name: 'Netflix, Inc. (Mexico)' }
  ],
  'nvidia': [
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    { symbol: 'NVDA.MX', name: 'NVIDIA Corporation (Mexico)' }
  ],
  'jpmorgan': [
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
    { symbol: 'JPM.MX', name: 'JPMorgan Chase & Co. (Mexico)' }
  ],
  'visa': [
    { symbol: 'V', name: 'Visa Inc.' },
    { symbol: 'V.MX', name: 'Visa Inc. (Mexico)' }
  ]
};

/**
 * Get mock stock data for a symbol
 * @param {string} symbol - Stock symbol
 * @returns {Object} Stock data or null if not found
 */
function getMockStockData(symbol) {
  if (!symbol) return null;
  
  const upperSymbol = symbol.toUpperCase();
  
  // Check if we have direct data for this symbol
  if (stockData[upperSymbol]) {
    return { ...stockData[upperSymbol] };
  }
  
  // Generate random data for unknown symbols with warning
  return {
    ticker: upperSymbol,
    name: `${upperSymbol} (Mock Data)`,
    price: Math.round(Math.random() * 1000 * 100) / 100,
    currency: 'USD',
    change: Math.round((Math.random() * 10 - 5) * 100) / 100,
    changePercent: Math.round((Math.random() * 6 - 3) * 100) / 100,
    dayHigh: Math.round(Math.random() * 1000 * 100) / 100,
    dayLow: Math.round(Math.random() * 900 * 100) / 100,
    updatedAt: '2025-05-09T20:00:00.000Z',
    isMarketClosed: true,
    lastTradingDate: '2025-05-09',
    isMockData: true
  };
}

/**
 * Get mock search results
 * @param {string} query - Search query
 * @returns {Array} Search results
 */
function getMockSearchResults(query) {
  if (!query || query.length < 2) return [];
  
  const lowerQuery = query.toLowerCase();
  
  // Check for exact matches in our mock data
  for (const key in searchResults) {
    if (key.includes(lowerQuery) || lowerQuery.includes(key)) {
      return searchResults[key];
    }
  }
  
  // For anything else, return a basic result with the query
  return [
    { symbol: query.toUpperCase(), name: `${query.toUpperCase()} (Mock Data)` }
  ];
}

module.exports = {
  getMockStockData,
  getMockSearchResults
};
