// src/routes/stockRoutes.js
const express = require('express');
const router = express.Router();
const { fetchStockBySymbol, searchStocksByName } = require('../api/stockApi'); // stockApi.js의 함수들을 가져옵니다.

// errorHandler 유틸리티를 가져옵니다. 실제 경로에 맞게 수정하세요.
// createError.badRequest, createError.notFound 등이 있다고 가정합니다.
// 만약 errorHandler.js에 createError 객체가 없다면, 직접 에러 객체를 생성해야 합니다.
// 예: const { handleRouteError, createCustomError } = require('../utils/errorHandler');
// 여기서는 제공된 코드의 createError를 가정합니다.
const { createError } = require('../utils/errorHandler'); // 경로가 정확한지 확인하세요.

/**
 * @route   GET /api/stock/search (또는 /api/stock/search?q=QUERY)
 * @desc    주식 또는 암호화폐를 이름이나 심볼로 검색합니다.
 * @access  Public
 * @query   q - 검색어
 */
router.get('/search', async (req, res, next) => { // 경로를 /search로 변경하고, 쿼리 파라미터 'q'를 사용합니다.
  try {
    const { q } = req.query; // req.params.query 대신 req.query.q를 사용

    if (!q || q.trim().length < 1) { // 검색어 유효성 검사 (1글자 이상 허용으로 stockApi.js와 일치)
      // createError 유틸리티가 없다면:
      // const err = new Error('Search query must be at least 1 character');
      // err.status = 400;
      // return next(err);
      return next(createError.badRequest('Search query must be at least 1 character long.'));
    }

    const searchResults = await searchStocksByName(q.trim());

    // stockApi.js에서 에러 시 빈 배열을 반환하므로, searchResults가 null일 경우는 거의 없습니다.
    // 결과가 없어도 빈 배열이 정상 응답입니다.

    // 캐시 제어 헤더 설정 (클라이언트 및 프록시 캐싱)
    res.set('Cache-Control', 'public, max-age=300'); // 5분 캐싱

    res.json(searchResults);
  } catch (error) {
    // stockApi.js의 searchStocksByName에서 에러 발생 시 이미 로깅되고 빈 배열을 반환할 수 있습니다.
    // 만약 searchStocksByName이 에러를 throw 하도록 수정되었다면 여기서 처리합니다.
    console.error(`Error in /search route for query "${req.query.q}":`, error);
    // next(createError.internalServerError('Failed to search stocks.')); // 일반적인 서버 오류로 처리
    next(error); // 발생한 에러를 그대로 에러 핸들러로 전달
  }
});

/**
 * @route   GET /api/stock/:symbol
 * @desc    특정 심볼의 주식 또는 암호화폐 정보를 가져옵니다.
 * @access  Public
 */
router.get('/:symbol', async (req, res, next) => {
  try {
    const symbol = req.params.symbol; // .toUpperCase()는 stockApi 내부에서 처리하므로 여기선 필요 X

    if (!symbol || symbol.trim() === '') {
      return next(createError.badRequest('Stock symbol is required.'));
    }

    // fetchStockBySymbol은 데이터를 찾지 못하거나 내부 오류 시 null을 반환하도록 수정되었습니다.
    const stockData = await fetchStockBySymbol(symbol.trim());

    if (!stockData) {
      // 데이터가 null이면, API에서 데이터를 찾지 못했거나 가져오는 데 실패한 것입니다.
      return next(createError.notFound(`Data not found for symbol '${req.params.symbol}'. It may be an invalid symbol or no recent data is available.`));
    }

    // 캐시 제어 헤더 설정
    res.set('Cache-Control', 'public, max-age=300'); // 5분 캐싱

    res.json(stockData);
  } catch (error) {
    // fetchStockBySymbol에서 예상치 못한 에러가 throw된 경우 (예: 네트워크 단절 전 캐시도 없는 초기 요청)
    console.error(`Error in /:symbol route for symbol "${req.params.symbol}":`, error);
    // next(createError.internalServerError(`Failed to retrieve data for symbol '${req.params.symbol}'.`));
    next(error); // 발생한 에러를 그대로 에러 핸들러로 전달
  }
});

module.exports = router;