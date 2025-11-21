# Apidog 연동 가이드

이 프로젝트는 [Apidog 프로젝트](https://app.apidog.com/project/1100203)와 연동됩니다.

## 1. OpenAPI 스펙 파일

Apidog에서 export한 OpenAPI 스펙 파일이 `openapi.json`에 저장되어 있습니다.

### Export된 API 엔드포인트 목록

주요 API 엔드포인트:

#### 사용자 관련
- `GET /users/me/profile` - 내 프로필 보기
- `GET /users/me/reservations` - 내 예약 조회
- `GET /users/me/reservatiaons/{reservationId}` - 내 예약/취소 상세 조회

#### 출항 일정 관련
- `GET /main` - 출항 일정 검색(메인페이지 조회)
- `GET /schedules/{schedulePublicId}` - 출항 일정 상세보기
- `POST /schedules` - 출항 일정 생성하기
- `DELETE /schedules/{schedulePublicId}` - 출항 일정 삭제
- `PATCH /schedules/{schedulePublicId}/departure` - 출항 시간 변경
- `GET /schedules/departure` - 관리자: 메인페이지서 출항 시간 보기
- `POST /schedules/{schedulePublicId}/departure/cancel` - 출항 취소
- `POST /schedules/{schedulePublicId}/departure/delay` - 출항 연기
- `POST /schedules/{schedulePublicId}/departure/confirmation` - 출항 확정 메시지 전송
- `PATCH /schedules/{schedulePublicId}/drawn` - 선예약 마감

#### 예약 관련
- `GET /schedules/{schedulePublicId}/reservation/early` - 선예약 팝업 조회
- `GET /schedules/{schedulePublicId}/reservation/normal` - 일반예약 팝업 조회
- `POST /schedules/{schedulePublicId}/reservation` - 예약
- `GET /reservations` - 예약 검색
- `GET /reservations/{reservationPublicId}` - 예약 상세 조회
- `PATCH /reservations/{reservationPublicId}/process` - 입금 확인/취소 접수/취소 완료 변경
- `POST /reservations/{reservationPublicId}/coupon` - 쿠폰 발급

#### 배 관련
- `GET /ships` - 배 리스트 조회 / 스케줄 생성할 때 필요한 조회
- `POST /ships` - 배 생성 api
- `PUT /ships/{shipId}` - 배 수정 api
- `POST /ships/delete` - 배 삭제 api

#### SMS 관련
- `POST /sms/search` - SMS 내역 검색

#### 인증 관련
- `GET /auth/{provider}/start` - 소셜 로그인 시작
- `GET /auth/logout` - 로그아웃
- `GET /user/oauth2` - 회원가입

## 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일 생성:

```env
VITE_API_BASE_URL=https://jjubul.duckdns.org
```

## 3. 프론트엔드 코드 연동

### API 호출 예시

`src/utils/api.js`의 함수를 사용하여 API 호출:

```javascript
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '../utils/api';

// 출항 일정 조회
const response = await apiGet('/main', {
  from: '2025-01-01T00:00:00',
  to: '2025-01-31T23:59:59'
});
const data = await response.json();

// 출항 일정 생성
const response = await apiPost('/schedules', {
  startDate: '2025-01-01',
  endDate: '2025-01-31',
  shipId: 1,
  scheduleType: 'NORMAL'
});

// 예약 상세 조회
const response = await apiGet(`/reservations/${reservationPublicId}`);
const data = await response.json();

// 예약 상태 변경
const response = await apiPatch(`/reservations/${reservationPublicId}/process`, {
  process: 'DEPOSIT_COMPLETED'
});

// 배 리스트 조회
const response = await apiGet('/ships?page=0&size=10');
const data = await response.json();

// 배 생성
const response = await apiPost('/ships', {
  fishType: '쭈갑',
  price: 90000,
  maxHeadCount: 20,
  notification: '공지사항'
});

// 배 수정
const response = await apiPut(`/ships/${shipId}`, {
  fishType: '쭈갑',
  price: 95000,
  maxHeadCount: 20,
  notification: '수정된 공지사항'
});

// 배 삭제
const response = await apiPost('/ships/delete', {
  shipIds: [1, 2, 3]
});
```

## 4. 응답 형식

모든 API 응답은 다음과 같은 형식을 따릅니다:

```typescript
interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T | null;
}
```

### 예시

```json
{
  "success": true,
  "code": 200,
  "message": "",
  "data": {
    // 실제 데이터
  }
}
```

## 5. 인증

대부분의 API는 인증이 필요합니다. 토큰은 `localStorage`에서 자동으로 가져와 `Authorization: Bearer <token>` 헤더로 추가됩니다.

로그인 후 토큰을 저장:

```javascript
localStorage.setItem('token', responseData.token);
```

## 6. Apidog 프로젝트 동기화

Apidog 프로젝트에서 API를 수정하면:
1. Apidog에서 OpenAPI 스펙을 다시 export
2. `openapi.json` 파일을 업데이트
3. 프로젝트에 반영

## 7. 주의사항

1. **엔드포인트 경로**: 일부 API는 `/api` 접두사가 없습니다 (예: `/main`, `/schedules`)
2. **인증**: 대부분의 API는 Bearer Token 인증이 필요합니다
3. **응답 형식**: 모든 응답은 `ApiResponse<T>` 형식을 따릅니다
4. **에러 처리**: `success: false`일 경우 `code`와 `message`를 확인하세요

## 8. Apidog 프로젝트 URL

https://app.apidog.com/project/1100203
