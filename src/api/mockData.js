/**
 * Mock data for development and testing
 */

// Mock search results
const mockSearchResults = [
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', type: 'EQUITY' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', type: 'EQUITY' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', exchange: 'NASDAQ', type: 'EQUITY' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', type: 'EQUITY' },
  { symbol: 'FB', name: 'Meta Platforms, Inc.', exchange: 'NASDAQ', type: 'EQUITY' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', exchange: 'NASDAQ', type: 'EQUITY' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', type: 'EQUITY' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE', type: 'EQUITY' },
  { symbol: 'V', name: 'Visa Inc.', exchange: 'NYSE', type: 'EQUITY' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE', type: 'EQUITY' }
];

// Mock stock details
const mockStockDetails = {
  'AAPL': {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    price: 179.66,
    change: 2.35,
    changePercent: 1.32,
    dayHigh: 180.42,
    dayLow: 177.83,
    currency: 'USD',
    exchange: 'NASDAQ',
    isMarketClosed: false,
    updatedAt: new Date().toISOString(),
    lastTradingDate: new Date().toLocaleDateString(),
    isMockData: true
  },
  'MSFT': {
    ticker: 'MSFT',
    name: 'Microsoft Corporation',
    price: 374.51,
    change: -0.65,
    changePercent: -0.17,
    dayHigh: 377.10,
    dayLow: 373.53,
    currency: 'USD',
    exchange: 'NASDAQ',
    isMarketClosed: false,
    updatedAt: new Date().toISOString(),
    lastTradingDate: new Date().toLocaleDateString(),
    isMockData: true
  },
  'AMZN': {
    ticker: 'AMZN',
    name: 'Amazon.com, Inc.',
    price: 181.23,
    change: 1.78,
    changePercent: 0.99,
    dayHigh: 182.05,
    dayLow: 179.52,
    currency: 'USD',
    exchange: 'NASDAQ',
    isMarketClosed: false,
    updatedAt: new Date().toISOString(),
    lastTradingDate: new Date().toLocaleDateString(),
    isMockData: true
  },
  'GOOGL': {
    ticker: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 143.96,
    change: 0.43,
    changePercent: 0.30,
    dayHigh: 144.68,
    dayLow: 142.95,
    currency: 'USD',
    exchange: 'NASDAQ',
    isMarketClosed: false,
    updatedAt: new Date().toISOString(),
    lastTradingDate: new Date().toLocaleDateString(),
    isMockData: true
  }
};

/**
 * Get mock search results based on a query
 * @param {string} query - Search query
 * @param {number} limit - Maximum number of results
 * @returns {Array} - Filtered mock search results
 */
const getMockSearchResults = (query, limit = 10) => {
  if (!query || query.trim().length < 2) {
    return [];
  }
  
  const normalizedQuery = query.toLowerCase().trim();
  
  return mockSearchResults
    .filter(item => 
      item.symbol.toLowerCase().includes(normalizedQuery) || 
      item.name.toLowerCase().includes(normalizedQuery)
    )
    .slice(0, limit);
};

/**
 * Get mock stock details for a symbol
 * @param {string} symbol - Stock symbol
 * @returns {Object|null} - Mock stock details or null if not found
 */
const getMockStockDetails = (symbol) => {
  if (!symbol) {
    return null;
  }
  
  const normalizedSymbol = symbol.toUpperCase().trim();
  
  // Check if the symbol exists in our mock data
  if (mockStockDetails[normalizedSymbol]) {
    return { ...mockStockDetails[normalizedSymbol] };
  }
  
  // Check if the symbol exists in our search results
  const searchResult = mockSearchResults.find(item => item.symbol === normalizedSymbol);
  if (searchResult) {
    // Generate random stock details for known symbols
    return {
      ticker: searchResult.symbol,
      name: searchResult.name,
      price: +(100 + Math.random() * 900).toFixed(2),
      change: +(Math.random() * 10 - 5).toFixed(2),
      changePercent: +(Math.random() * 5 - 2.5).toFixed(2),
      dayHigh: +(100 + Math.random() * 900 + 5).toFixed(2),
      dayLow: +(100 + Math.random() * 900 - 5).toFixed(2),
      currency: 'USD',
      exchange: searchResult.exchange,
      isMarketClosed: false,
      updatedAt: new Date().toISOString(),
      lastTradingDate: new Date().toLocaleDateString(),
      isMockData: true
    };
  }
  
  return null;
};

module.exports = {
  getMockSearchResults,
  getMockStockDetails
};