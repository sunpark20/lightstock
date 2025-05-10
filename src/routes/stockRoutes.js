const express = require('express');
const router = express.Router();
const { fetchStockBySymbol, searchStocksByName } = require('../api/stockApi');
const { createError } = require('../utils/errorHandler');

/**
 * @route   GET /api/stock/search/query
 * @desc    Search stocks by company name
 * @access  Public
 */
router.get('/search/query', async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return next(createError.badRequest('Search query must be at least 2 characters'));
    }
    
    const searchResults = await searchStocksByName(q);
    
    // Set cache control headers
    res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
    
    res.json(searchResults);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/stock/:symbol
 * @desc    Get stock information by ticker symbol
 * @access  Public
 */
router.get('/:symbol', async (req, res, next) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    
    if (!symbol || symbol.trim() === '') {
      return next(createError.badRequest('Stock symbol is required'));
    }
    
    const stockData = await fetchStockBySymbol(symbol);
    
    // Set cache control headers
    res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
    
    res.json(stockData);
  } catch (error) {
    // Handle different error types with appropriate messages
    if (error.message.includes('API request failed')) {
      return next(createError.notFound(`Stock with symbol '${req.params.symbol}' not found`));
    } else if (error.message.includes('Market may be closed')) {
      return next(createError.notFound(`Market is currently closed. Could not retrieve data for '${req.params.symbol}'`));
    } else if (error.message.includes('No historical data available')) {
      return next(createError.notFound(`No recent trading data available for '${req.params.symbol}'`));
    }
    next(error);
  }
});

module.exports = router;