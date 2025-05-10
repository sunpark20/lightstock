const fetch = require('node-fetch');
const { ApiError } = require('../utils/errorHandler');

/**
 * Service for interacting with Yahoo Finance API
 */
class YahooFinanceService {
  constructor() {
    this.baseUrl = process.env.STOCK_API_BASE_URL || 'https://query1.finance.yahoo.com';
    this.searchEndpoint = '/v1/finance/search';
    this.quoteEndpoint = '/v7/finance/quote';
    this.retryLimit = 3;
    this.retryDelay = 1000; // 1 second
  }

  /**
   * Search for stocks by query (company name or ticker)
   * @param {string} query - Search term
   * @param {number} limit - Maximum number of results to return
   * @returns {Promise<Array>} - Array of stock search results
   */
  async searchStocks(query, limit = 10) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const url = new URL(`${this.baseUrl}${this.searchEndpoint}`);
      url.searchParams.append('q', query.trim());
      url.searchParams.append('quotesCount', limit.toString());
      url.searchParams.append('newsCount', '0');
      
      const response = await this._fetchWithRetry(url);
      
      if (!response.quotes || !Array.isArray(response.quotes)) {
        return [];
      }
      
      // Map response to a simplified format
      return response.quotes
        .filter(quote => quote.symbol && quote.shortname)
        .map(quote => ({
          symbol: quote.symbol,
          name: quote.shortname || quote.longname || quote.symbol,
          exchange: quote.exchange || 'N/A',
          type: quote.quoteType || 'EQUITY'
        }));
    } catch (error) {
      console.error('Error searching stocks:', error);
      throw new ApiError(503, 'Unable to search stocks at this time');
    }
  }

  /**
   * Get detailed stock information by ticker symbol
   * @param {string} symbol - Stock ticker symbol
   * @returns {Promise<Object>} - Stock details
   */
  async getStockDetails(symbol) {
    if (!symbol) {
      throw new ApiError(400, 'Stock symbol is required');
    }

    try {
      const url = new URL(`${this.baseUrl}${this.quoteEndpoint}`);
      url.searchParams.append('symbols', symbol.trim());
      url.searchParams.append('lang', 'en-US');
      url.searchParams.append('region', 'US');
      url.searchParams.append('corsDomain', 'finance.yahoo.com');
      
      const response = await this._fetchWithRetry(url);
      
      if (!response.quoteResponse || 
          !response.quoteResponse.result || 
          !response.quoteResponse.result.length) {
        throw new ApiError(404, `Stock not found: ${symbol}`);
      }
      
      const stockData = response.quoteResponse.result[0];
      
      // Map to a simplified format with only the data we need
      return {
        ticker: stockData.symbol,
        name: stockData.shortName || stockData.longName || stockData.symbol,
        price: stockData.regularMarketPrice,
        change: stockData.regularMarketChange,
        changePercent: stockData.regularMarketChangePercent,
        dayHigh: stockData.regularMarketDayHigh,
        dayLow: stockData.regularMarketDayLow,
        currency: stockData.currency || 'USD',
        exchange: stockData.fullExchangeName || stockData.exchange,
        isMarketClosed: stockData.marketState !== 'REGULAR',
        updatedAt: new Date(stockData.regularMarketTime * 1000).toISOString(),
        lastTradingDate: stockData.regularMarketTime
          ? new Date(stockData.regularMarketTime * 1000).toLocaleDateString()
          : null,
        isMockData: false
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error fetching stock details:', error);
      throw new ApiError(503, 'Unable to fetch stock details at this time');
    }
  }

  /**
   * Fetch with retry logic
   * @private
   * @param {URL} url - URL to fetch
   * @param {number} retryCount - Current retry count
   * @returns {Promise<Object>} - Parsed JSON response
   */
  async _fetchWithRetry(url, retryCount = 0) {
    try {
      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'LightStock/1.0.0'
        },
        timeout: 5000 // 5 second timeout
      });

      if (!response.ok) {
        // Handle rate limiting
        if (response.status === 429 && retryCount < this.retryLimit) {
          console.warn(`Rate limited. Retrying in ${this.retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
          return this._fetchWithRetry(url, retryCount + 1);
        }

        throw new ApiError(response.status, `API returned ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      // Network errors or timeouts
      if (error.name === 'AbortError' || error.name === 'FetchError') {
        if (retryCount < this.retryLimit) {
          console.warn(`Network error. Retrying in ${this.retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
          return this._fetchWithRetry(url, retryCount + 1);
        }
      }
      throw error;
    }
  }
}

// Export as singleton
module.exports = new YahooFinanceService();