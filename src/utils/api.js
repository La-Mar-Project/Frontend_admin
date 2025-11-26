/**
 * API 유틸리티 함수
 * 백엔드 API 호출을 위한 공통 함수들
 */

// 환경 변수에서 API 기본 URL 가져오기
// 개발 환경: Vite 프록시 사용 (CORS 회피) → 빈 문자열로 설정하면 상대 경로로 요청되어 프록시가 자동으로 백엔드로 전달
// 프로덕션 환경: 실제 백엔드 URL 사용 (.env 파일의 VITE_API_BASE_URL 사용)
const API_BASE_URL = import.meta.env.PROD 
  ? (import.meta.env.VITE_API_BASE_URL || '')
  : '';

/**
 * API 요청을 보내는 공통 함수
 * @param {string} endpoint - API 엔드포인트 (예: '/api/company/info')
 * @param {object} options - fetch 옵션 (method, headers, body 등)
 * @returns {Promise<Response>}
 */
export const apiRequest = async (endpoint, options = {}) => {
  // 엔드포인트가 전체 URL이 아닌 경우 기본 URL 추가
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${API_BASE_URL}${endpoint}`;

  // 디버깅: API 요청 정보 출력
  console.log('[API Request]', {
    method: options.method || 'GET',
    endpoint,
    url,
    API_BASE_URL,
    isProduction: import.meta.env.PROD,
    isDevelopment: import.meta.env.DEV
  });

  // 기본 헤더 설정
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // 토큰이 있으면 Authorization 헤더 추가 (localStorage에서 가져오기)
  // adminToken 또는 token 둘 다 확인
  let token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  
  // 로컬 토큰 감지 및 거부 (백엔드 JWT 토큰만 허용)
  const isLocalToken = (token) => {
    if (!token) return false;
    // 백엔드 JWT 토큰은 400자 이상이고 eyJ로 시작
    // 로컬 토큰은 짧고 base64 인코딩된 username:timestamp 형태 (보통 20-50자)
    const isJWT = token.length >= 400 && token.startsWith('eyJ');
    return !isJWT;
  };
  
  // 로컬 토큰이면 즉시 제거하고 경고
  if (token && isLocalToken(token)) {
    console.error('[API Request] ❌❌❌ 로컬 토큰이 감지되었습니다! 즉시 제거합니다.');
    console.error('[API Request] 로컬 토큰:', token.substring(0, 50), `(길이: ${token.length})`);
    console.error('[API Request] 토큰 전체:', token);
    // 모든 토큰 관련 localStorage 항목 제거
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminType');
    token = null;
    console.warn('[API Request] ⚠️ 로컬 토큰을 제거했습니다. 백엔드 JWT 토큰으로 다시 로그인해주세요.');
    // 로컬 토큰이면 API 요청을 중단하고 에러 발생
    throw new Error('로컬 토큰이 감지되었습니다. 백엔드 토큰으로 다시 로그인해주세요.');
  }
  
  console.log('[API Request] localStorage에서 토큰 확인:', {
    adminToken: localStorage.getItem('adminToken') ? localStorage.getItem('adminToken').substring(0, 30) + '...' : '없음',
    token: localStorage.getItem('token') ? localStorage.getItem('token').substring(0, 30) + '...' : '없음',
    사용할토큰: token ? token.substring(0, 30) + '...' : '없음',
    토큰타입: token ? (isLocalToken(token) ? '로컬토큰(거부됨)' : '백엔드JWT') : '없음',
    토큰길이: token ? token.length : 0
  });
  
  if (token) {
    // 토큰에 이미 "Bearer "가 포함되어 있으면 그대로 사용, 없으면 추가
    const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    defaultHeaders['Authorization'] = authHeader;
    console.log('[API Request] Authorization 헤더 설정:', authHeader.substring(0, 40) + '...');
  } else {
    console.warn('[API Request] 토큰이 없어서 Authorization 헤더를 추가하지 않음');
  }

  // 옵션 병합 (options.headers가 있으면 우선 적용, 없으면 defaultHeaders 사용)
  // 단, Authorization 헤더는 토큰이 있으면 항상 포함되도록 보장
  const mergedHeaders = {
    ...defaultHeaders,
    ...options.headers, // options.headers가 있으면 defaultHeaders를 덮어씀
  };
  
  // 토큰이 있으면 Authorization 헤더를 항상 설정 (다른 헤더에 의해 덮어써지지 않도록)
  if (token) {
    const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    mergedHeaders['Authorization'] = authHeader;
  }
  
  const config = {
    ...options,
    headers: mergedHeaders,
  };
  
  // 디버깅: 최종 헤더 확인
  console.log('[API Request] 최종 헤더:', {
    'Content-Type': config.headers['Content-Type'],
    'Authorization': config.headers['Authorization'] ? config.headers['Authorization'].substring(0, 30) + '...' : '없음',
    '모든 헤더 키': Object.keys(config.headers),
    'Authorization 전체': config.headers['Authorization'] ? config.headers['Authorization'] : '없음'
  });

  try {
    console.log('[API Request] 실제 요청 URL:', url);
    console.log('[API Request] 요청 설정:', config);
    console.log('[API Request] API_BASE_URL:', API_BASE_URL);
    console.log('[API Request] Authorization 헤더:', token ? 'Bearer ' + token.substring(0, 20) + '...' : '없음');
    
    const response = await fetch(url, config);
    console.log('[API Response]', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      url: response.url,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    // 응답 Content-Type 확인
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // HTML 응답인 경우 (에러 페이지)
      if (contentType && contentType.includes('text/html')) {
        const text = await response.text();
        console.error('API 서버가 HTML을 반환했습니다. 응답:', text.substring(0, 500));
        throw new Error(`서버 오류: ${response.status} ${response.statusText}. API URL을 확인해주세요: ${url}`);
      }
    }
    
    return response;
  } catch (error) {
    console.error('API 요청 실패:', error);
    console.error('요청 URL:', url);
    console.error('API_BASE_URL:', API_BASE_URL);
    throw error;
  }
};

/**
 * GET 요청
 * @param {string} endpoint - API 엔드포인트
 * @param {object} headers - 추가 헤더
 * @returns {Promise<Response>}
 */
export const apiGet = async (endpoint, headers = {}) => {
  return apiRequest(endpoint, {
    method: 'GET',
    headers,
  });
};

/**
 * POST 요청
 * @param {string} endpoint - API 엔드포인트
 * @param {object} data - 요청 본문 데이터
 * @param {object} headers - 추가 헤더
 * @returns {Promise<Response>}
 */
export const apiPost = async (endpoint, data, headers = {}) => {
  return apiRequest(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
};

/**
 * PUT 요청
 * @param {string} endpoint - API 엔드포인트
 * @param {object} data - 요청 본문 데이터
 * @param {object} headers - 추가 헤더
 * @returns {Promise<Response>}
 */
export const apiPut = async (endpoint, data, headers = {}) => {
  return apiRequest(endpoint, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });
};

/**
 * PATCH 요청
 * @param {string} endpoint - API 엔드포인트
 * @param {object} data - 요청 본문 데이터
 * @param {object} headers - 추가 헤더
 * @returns {Promise<Response>}
 */
export const apiPatch = async (endpoint, data, headers = {}) => {
  return apiRequest(endpoint, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  });
};

/**
 * DELETE 요청
 * @param {string} endpoint - API 엔드포인트
 * @param {object} headers - 추가 헤더
 * @returns {Promise<Response>}
 */
export const apiDelete = async (endpoint, headers = {}) => {
  return apiRequest(endpoint, {
    method: 'DELETE',
    headers,
  });
};

