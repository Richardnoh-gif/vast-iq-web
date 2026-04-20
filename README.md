# VAST IQ Web App

React + Vite 기반으로 변환된 VAST IQ 앱입니다. `VAST IQ.html`에서 가져온 전략 리포트 생성 인터페이스를 사용할 수 있습니다.

## 설치

1. `cd vast-iq-web`
2. `npm install`
3. `.env` 파일을 생성하고 `VITE_API_KEY=your_api_key_here`를 설정합니다.

## 실행

- `npm run dev`

## 배포

- GitHub Pages: `npm run build` 후 `dist/`를 GitHub Pages에 배포
- Vercel/Netlify: 리포지토리를 연결하고 `npm run build`를 빌드 커맨드로 설정

> 이 앱은 Google Gemini API 키를 필요로 합니다. 브라우저에서 API 키를 직접 노출하지 않으면 서버사이드 프록시 또는 안전한 환경에서 배포하세요.
