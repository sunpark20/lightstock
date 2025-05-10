const fetch = require('node-fetch');
const cache = require('memory-cache');
const { getMockStockData, getMockSearchResults } = require('./mockData');

// Base URL for Yahoo Finance API
const BASE_URL = process.env.STOCK_API_BASE_URL || 'https://query1.finance.yahoo.com';
const CACHE_DURATION = parseInt(process.env.CACHE_DURATION) || 300000; // 5 minutes default

/**
 * Fetch stock data by ticker symbol
 * @param {string} symbol - The stock ticker symbol
 * @returns {Promise<Object>} Stock data
 */
async function fetchStockBySymbol(symbol) {
  if (!symbol) {
    throw new Error('Stock symbol is required');
  }

  // Check cache first
  const cacheKey = `stock_${symbol.toUpperCase()}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    // Yahoo Finance API to get basic stock data
    const url = `${BASE_URL}/v8/finance/quote?symbols=${encodeURIComponent(symbol)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if we received valid results
    if (!data.quoteResponse || !data.quoteResponse.result || data.quoteResponse.result.length === 0) {
      // Try fetching historical data for the last available trading day
      return await fetchHistoricalStockData(symbol);
    }
    
    // Parse and normalize the response
    const stockData = parseApiResponse(data);
    
    // Cache the result
    cache.put(cacheKey, stockData, CACHE_DURATION);
    
    return stockData;
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error);
    
    // Use historical data as fallback for most errors
    try {
      return await fetchHistoricalStockData(symbol);
    } catch (histError) {
      console.error(`Error fetching historical data for ${symbol}:`, histError);
      
      // Use mock data as last resort
      console.log(`Using mock data for ${symbol} due to API error`);
      const mockData = getMockStockData(symbol);
      
      // Cache the mock result
      cache.put(cacheKey, mockData, CACHE_DURATION);
      
      return mockData;
    }
  }
}

/**
 * Search stocks by company name
 * @param {string} query - The search query (company name)
 * @returns {Promise<Array>} List of matching stocks
 */
async function searchStocksByName(query) {
  if (!query || query.length < 2) {
    throw new Error('Search query must be at least 2 characters');
  }

  // Check cache first
  const cacheKey = `search_${query.toLowerCase()}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    // Yahoo Finance API for searching stocks
    const url = `${BASE_URL}/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`;
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
    
    // Cache the results
    cache.put(cacheKey, results, CACHE_DURATION);
    
    return results;
  } catch (error) {
    console.error(`Error searching stocks for "${query}":`, error);
    
    // Fall back to mock data for search
    console.log(`Using mock search data for "${query}" due to API error`);
    const mockResults = getMockSearchResults(query);
    
    // Cache the mock results
    cache.put(cacheKey, mockResults, CACHE_DURATION);
    
    return mockResults;
  }
}

/**
 * Parse and normalize API response
 * @param {Object} response - The raw API response
 * @returns {Object} Normalized stock data
 */
function parseApiResponse(response) {
  if (!response || !response.quoteResponse || !response.quoteResponse.result || !response.quoteResponse.result.length) {
    throw new Error('Invalid API response format');
  }

  const stock = response.quoteResponse.result[0];
  
  // Check if market is open
  const marketState = stock.marketState || 'CLOSED';
  const isMarketOpen = marketState === 'REGULAR' || marketState === 'OPEN';
  
  // Extract only the fields we need to minimize data
  return {
    ticker: stock.symbol,
    name: stock.shortName || stock.longName || stock.symbol,
    price: stock.regularMarketPrice !== undefined ? stock.regularMarketPrice : null,
    currency: stock.currency || 'USD',
    change: stock.regularMarketChange !== undefined ? stock.regularMarketChange : null,
    changePercent: stock.regularMarketChangePercent !== undefined ? stock.regularMarketChangePercent : null,
    dayHigh: stock.regularMarketDayHigh !== undefined ? stock.regularMarketDayHigh : null,
    dayLow: stock.regularMarketDayLow !== undefined ? stock.regularMarketDayLow : null,
    updatedAt: stock.regularMarketTime ? new Date(stock.regularMarketTime * 1000).toISOString() : new Date().toISOString(),
    isMarketClosed: !isMarketOpen,
    marketState: marketState
  };
}

/**
 * Clear cache for a specific stock
 * @param {string} symbol - The stock ticker symbol
 */
function clearCache(symbol) {
  if (symbol) {
    cache.del(`stock_${symbol.toUpperCase()}`);
  }
}

/**
 * Fetch historical stock data for the most recent trading day
 * @param {string} symbol - The stock ticker symbol
 * @returns {Promise<Object>} Stock data
 */
async function fetchHistoricalStockData(symbol) {
  try {
    // Get timestamp for 7 days ago (to ensure we get some data even after holidays/weekends)
    const endDate = Math.floor(Date.now() / 1000);
    const startDate = endDate - (7 * 24 * 60 * 60); // 7 days ago
    
    // Yahoo Finance API to get historical data
    const url = `${BASE_URL}/v8/finance/chart/${encodeURIComponent(symbol)}?period1=${startDate}&period2=${endDate}&interval=1d`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Historical API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if we received valid results
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      throw new Error('No historical data available');
    }
    
    const result = data.chart.result[0];
    const quotes = result.indicators.quote[0];
    const timestamps = result.timestamp;
    
    // Make sure we have data
    if (!quotes.close || quotes.close.length === 0) {
      throw new Error('No historical price data available');
    }
    
    // Get the most recent trading day data (last element in the array)
    const lastIndex = quotes.close.length - 1;
    
    // Extract symbol metadata
    const meta = result.meta;
    
    // Format the data in the same structure as the regular API response
    return {
      ticker: symbol,
      name: meta.shortName || meta.exchangeName || symbol,
      price: quotes.close[lastIndex],
      currency: meta.currency || 'USD',
      change: lastIndex > 0 ? quotes.close[lastIndex] - quotes.close[lastIndex - 1] : 0,
      changePercent: lastIndex > 0 ? ((quotes.close[lastIndex] - quotes.close[lastIndex - 1]) / quotes.close[lastIndex - 1]) * 100 : 0,
      dayHigh: quotes.high[lastIndex],
      dayLow: quotes.low[lastIndex],
      updatedAt: new Date(timestamps[lastIndex] * 1000).toISOString(),
      isMarketClosed: true, // Flag to indicate this is historical data
      lastTradingDate: new Date(timestamps[lastIndex] * 1000).toLocaleDateString()
    };
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    throw new Error(`Cannot retrieve historical stock data for ${symbol}. Market may be closed.`);
  }
}

module.exports = {
  fetchStockBySymbol,
  searchStocksByName,
  fetchHistoricalStockData,
  clearCache
};