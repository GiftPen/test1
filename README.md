# 날씨 앱

React + TypeScript로 구축된 실시간 날씨 정보 애플리케이션입니다.

## 주요 기능

- **실시간 날씨 정보**: 현재 위치 또는 선택한 지역의 현재 날씨를 표시
- **7일 일기예보**: 오늘부터 일주일간의 날씨 예보 제공
- **위치 기반 서비스**: 사용자 위치 자동 감지 (허용 시)
- **지역 검색**: 원하는 지역의 날씨 정보 검색
- **반응형 디자인**: 모바일과 데스크톱에서 모두 최적화

## 기술 스택

- **Frontend**: React 18, TypeScript
- **Build Tool**: Vite
- **Styling**: CSS3 (Flexbox, Grid)
- **Weather API**: Open-Meteo (완전 무료, API 키 불필요)
- **Geocoding API**: Nominatim OpenStreetMap (완전 무료)

## 시작하기

### 필수 요구사항

- Node.js 16.0 이상
- npm 또는 yarn

### 설치 및 실행

1. **의존성 설치**
   ```bash
   npm install
   ```

2. **개발 서버 실행**
   ```bash
   npm run dev
   ```
   
   > **참고**: Open-Meteo API와 Nominatim API를 사용하므로 별도의 API 키나 회원가입이 전혀 필요없습니다!

4. **빌드**
   ```bash
   npm run build
   ```

5. **타입 체크**
   ```bash
   npm run typecheck
   ```

6. **린트**
   ```bash
   npm run lint
   ```

## 사용 방법

1. **위치 정보 허용**: 첫 방문 시 위치 정보 사용 허가를 요청합니다
2. **기본 위치**: 위치 정보를 허용하지 않으면 서울의 날씨를 표시합니다
3. **지역 검색**: 상단의 검색창에서 원하는 지역명을 입력하여 해당 지역의 날씨를 확인할 수 있습니다

## 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── LocationInput.tsx    # 지역 검색 입력 컴포넌트
│   ├── WeatherDisplay.tsx   # 현재 날씨 표시 컴포넌트
│   └── WeeklyForecast.tsx   # 주간 예보 컴포넌트
├── types/              # TypeScript 타입 정의
│   └── weather.ts          # 날씨 관련 타입
├── utils/              # 유틸리티 함수
│   ├── location.ts         # 위치 관련 함수
│   └── weather.ts          # 날씨 API 관련 함수
├── App.tsx             # 메인 앱 컴포넌트
├── App.css             # 앱 스타일
└── main.tsx            # 앱 진입점
```

## API 정보

이 앱은 OpenWeatherMap API를 사용합니다:
- Current Weather Data API
- 5 Day Weather Forecast API

## 브라우저 지원

- Chrome (최신)
- Firefox (최신)
- Safari (최신)
- Edge (최신)

## 라이선스

MIT License