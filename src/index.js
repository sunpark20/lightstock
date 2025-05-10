{
  "version": 2,
  "builds": [
    {
      "src": "src/index.js", // Express 앱의 메인 진입점 파일
      "use": "@vercel/node"
    },
    {
      "src": "public/**", // public 폴더의 정적 파일들
      "use": "@vercel/static",
      "config": { "directoryListing": false }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)", // /api/ 로 시작하는 모든 요청을
      "dest": "src/index.js" // Express 앱 진입점으로 전달
    },
    // 정적 파일 라우팅은 Vercel이 빌드 시 자동으로 처리해줄 수 있으나, 명시적으로 public 폴더를 지정할 수도 있습니다.
    // 아래는 public 폴더의 파일을 직접 서비스하도록 하는 예시입니다.
    // build의 @vercel/static 이 public을 처리하게 되면 아래 public 라우팅은 중복이거나 다르게 동작할 수 있습니다.
    // Vercel은 public이라는 이름의 폴더를 자동으로 정적 호스팅하는 기능이 있습니다.
    // 따라서, public 폴더에 대한 명시적 라우트는 필요 없을 수도 있고,
    // @vercel/static 빌드 설정과 충돌하지 않도록 주의해야 합니다.
    // 가장 간단한 방법은 public 폴더를 Vercel이 자동으로 처리하도록 두고, API 라우트만 명시하는 것입니다.

    // 만약 public 폴더를 명시적으로 서비스하고 싶고, @vercel/static 빌드를 사용하지 않는다면:
    // { "handle": "filesystem" },
    // { "src": "/(.*)", "dest": "/public/$1" },
    // { "src": "/", "dest": "/public/index.html" }

    // Vercel이 public 폴더를 자동으로 정적 호스팅한다고 가정하고, 위의 @vercel/static 빌드를 사용한다면,
    // 아래 정적 파일 라우트는 필요 없을 수 있습니다.
    // 만약 특정 파일만 지정하고 싶다면 아래와 같이 할 수 있습니다.
    {
      "src": "/(.*\\.(js|css|json|png|jpg|gif|svg|ico|html|txt))$", // 정적 파일 확장자 매칭
      "dest": "/public/$1", // public 폴더에서 해당 파일 제공
      "headers": { "cache-control": "s-maxage=31536000,immutable" } // 정적 파일 장기 캐싱
    },
    {
      "src": "/((?!api/|.*\\.).*)", // API 경로도 아니고, 파일 확장자도 없는 요청 (SPA fallback)
      "dest": "/public/index.html", // index.html로 SPA fallback
      "status": 200
    },
    {
      "src": "/", // 루트 경로
      "dest": "/public/index.html",
      "status": 200
    }
  ]
}