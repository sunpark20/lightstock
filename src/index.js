// Load environment variables (optional for Vercel as it injects them, but good for local dev)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const path = require('path'); // path 모듈 추가
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import routes and middleware
const stockRoutes = require('./routes/stockRoutes');
const cacheMiddleware = require('./middleware/cache'); // cache.js 경로 확인
const requestLogger = require('./middleware/logger');   // logger.js 경로 확인
const { errorMiddleware } = require('./utils/errorHandler'); // errorHandler.js 경로 및 export 확인

// Initialize the app
const app = express();

// ★ Vercel은 PORT 환경 변수를 자동으로 설정하고 관리합니다.
// 로컬 개발 시에는 process.env.PORT를 사용하거나 기본값을 설정할 수 있습니다.
const PORT = process.env.PORT || 3001; // 포트 번호는 로컬 개발 시에만 의미가 있을 수 있음

// Apply global middleware
app.use(requestLogger); // 요청 로거
app.use(cors()); // CORS 허용 (필요에 따라 옵션 설정: app.use(cors({ origin: 'your-frontend-domain.com' })))
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false, // 프로덕션에서는 CSP 기본값 사용 고려, 개발 시에는 비활성화
}));
app.use(compression()); // 응답 압축
app.use(express.json()); // JSON 요청 바디 파싱

// Apply rate limiting to API routes or all routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 각 IP당 15분 동안 100개 요청 제한
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // RFC 6585 헤더 (RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset) 전송
  legacyHeaders: false, // X-RateLimit-* 헤더 비활성화
});
app.use('/api/', apiLimiter); // API 경로에만 레이트 리미터 적용

// API routes with caching (cacheMiddleware가 올바른 기간을 인자로 받도록 수정 필요 가능성)
// cacheMiddleware가 (duration) => (req, res, next) 형태의 고차 함수라면 아래처럼 사용
// 아니라면 cacheMiddleware 사용법에 맞게 수정
// 예시: const specificCache = cacheMiddleware(5 * 60 * 1000); app.use('/api/stock', specificCache, stockRoutes);
// cache.js가 단일 미들웨어 함수라면: app.use('/api/stock', cacheMiddleware, stockRoutes); (기간 설정은 cache.js 내부에서)
// 현재 cacheMiddleware가 어떻게 동작하는지 확인 필요. 제공된 코드에서는 인자 없이 사용.
app.use('/api/stock', cacheMiddleware, stockRoutes); // '/api/stock' 경로에 마운트

// Health check endpoint (optional)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// ★ 정적 파일 서빙은 Vercel이 vercel.json 설정을 통해 처리하는 것이 더 효율적입니다.
// Express 앱에서 정적 파일을 서빙하는 로직은 로컬 개발 시에는 유용하지만,
// Vercel 배포 시에는 vercel.json의 @vercel/static 빌드와 routes 설정으로 대체될 수 있습니다.
// 만약 vercel.json에서 모든 non-API 요청을 public/index.html로 보낸다면,
// 아래 Express의 정적 파일 및 SPA fallback은 Vercel 환경에서 호출되지 않을 수 있습니다.
// 로컬 개발을 위해 남겨둘 수 있습니다.
if (process.env.NODE_ENV !== 'production') {
  // Serve static files from the "public" directory for local development
  app.use(express.static(path.join(__dirname, '../public')));

  // Handle all other GET requests by serving index.html (SPA fallback for local dev)
  app.get('*', (req, res, next) => {
    // API 요청이나 이미 처리된 요청이 아닌 경우에만 index.html로 fallback
    if (req.path.startsWith('/api/') || res.headersSent) {
      return next();
    }
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });
}

// Error handling middleware (가장 마지막에 위치해야 함)
app.use(errorMiddleware);

// ★ Vercel 환경에서는 app.listen()을 호출하지 않습니다.
// Vercel은 module.exports 된 Express 앱을 직접 사용합니다.
// 아래 listen 부분은 로컬 개발 시에만 실행되도록 합니다.
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`LightStock server running locally on http://localhost:${PORT}`);
  });
}

// Export the Express app for Vercel
module.exports = app;