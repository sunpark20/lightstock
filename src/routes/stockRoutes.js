const express = require('express');
const router = express.Router();
const stockApi = require('../api/stockApi');
const mockData = require('../api/mockData');
const cacheService = require('../middleware/cache');
const { searchLimiter, stockLimiter } = require('../middleware/rateLimiter');
const { catchAsync } = require('../utils/errorHandler');

/**
 * @route GET /api/search
 * @description Search for stocks by company name or ticker symbol
 * @access Public
 */
router.get('/search', searchLimiter, cacheService.middleware(), catchAsync(async (req, res) => {
  const { q } = req.query;
  
  if (!q || q.trim().length < 2) {
    return res.status(400).json({ 
      error: 'Search query must be at least 2 characters' 
    });
  }
  
  // Try to get real data from Yahoo Finance API
  try {
    const searchResults = await stockApi.searchStocks(q);
    return res.json(searchResults);
  } catch (error) {
    console.warn('Failed to get stock search results from API, falling back to mock data:', error.message);
    
    // Fallback to mock data if API fails
    const mockResults = mockData.getMockSearchResults(q);
    
    // Add header to indicate mock data
    res.set('X-Data-Source', 'mock');
    return res.json(mockResults);
  }
}));

/**
 * @route GET /api/stock
 * @description Get detailed information for a specific stock
 * @access Public
 */
router.get('/stock', stockLimiter, cacheService.middleware(), catchAsync(async (req, res) => {
  const { symbol } = req.query;
  
  if (!symbol) {
    return res.status(400).json({ 
      error: 'Stock symbol is required' 
    });
  }
  
  // Try to get real data from Yahoo Finance API
  try {
    const stockDetails = await stockApi.getStockDetails(symbol);
    return res.json(stockDetails);
  } catch (error) {
    // If stock not found specifically, return 404
    if (error.statusCode === 404) {
      return res.status(404).json({ 
        error: `Stock not found: ${symbol}` 
      });
    }
    
    console.warn('Failed to get stock details from API, falling back to mock data:', error.message);
    
    // Fallback to mock data if API fails
    const mockDetails = mockData.getMockStockDetails(symbol);
    
    if (!mockDetails) {
      return res.status(404).json({ 
        error: `Stock not found: ${symbol}` 
      });
    }
    
    // Add header to indicate mock data
    res.set('X-Data-Source', 'mock');
    return res.json(mockDetails);
  }
}));

module.exports = router;