// 관리자 계정 정보
const ADMIN_CREDENTIALS = {
  username: 'admin1',
  password: '1111'
};

// 접속 기록 추가 함수
const addAccessLog = (userId, type, status, name) => {
  const logs = JSON.parse(localStorage.getItem('adminAccessLogs') || '[]');
  const now = new Date();
  const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const dateTimeStr = `${dateStr} ${timeStr}`;
  
  const newLog = {
    id: Date.now(),
    userId,
    type,
    name,
    date: dateStr,
    dateTime: dateTimeStr,
    status
  };
  
  logs.unshift(newLog); // 최신 기록을 맨 위에 추가
  localStorage.setItem('adminAccessLogs', JSON.stringify(logs));
};

// 로그인 처리 (접속 기록만 저장, 토큰은 절대 건드리지 않음)
// ⚠️ 중요: 이 함수는 토큰을 절대 설정하거나 수정하지 않습니다.
// 토큰 관리는 Login.jsx에서만 처리하며, 백엔드 JWT 토큰만 사용합니다.
export const login = (username, password) => {
  // 🔥 백엔드 토큰 백업 (덮어쓰기 방지)
  const existingToken = localStorage.getItem('adminToken');
  const isBackendToken = existingToken && existingToken.length > 400 && existingToken.startsWith('eyJ');
  
  let name = '';
  let loginSuccess = false;

  // 메인 관리자 계정 확인
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    name = '관리자';
    loginSuccess = true;
    // ⚠️ 토큰은 절대 설정하지 않음 - Login.jsx에서만 관리
    // ⚠️ 사용자 정보도 절대 설정하지 않음 - Login.jsx에서만 관리
  } else {
    // 보조 관리자 계정 확인
    const assistantAuth = JSON.parse(localStorage.getItem('assistantAuth') || '{}');
    if (assistantAuth[username]) {
      const assistant = assistantAuth[username];
      // 활성화되어 있고 비밀번호가 일치하는 경우
      if (assistant.active === '활성' && assistant.password === password) {
        name = assistant.name || username;
        loginSuccess = true;
        // ⚠️ 토큰은 절대 설정하지 않음 - Login.jsx에서만 관리
        // ⚠️ 사용자 정보도 절대 설정하지 않음 - Login.jsx에서만 관리
      }
    }
  }

  // 로그인 시도 기록 (성공/실패 모두 기록)
  if (loginSuccess) {
    addAccessLog(username, '로그인', '성공', name);
  } else {
    // 실패한 경우 이름을 찾기 위해 보조 관리자 목록 확인
    let failureName = username;
    const assistantManagers = JSON.parse(localStorage.getItem('assistantManagers') || '[]');
    const assistant = assistantManagers.find(a => a.userId === username);
    if (assistant && assistant.name) {
      failureName = assistant.name;
    } else {
      // 보조 관리자 auth에서도 확인
      const assistantAuth = JSON.parse(localStorage.getItem('assistantAuth') || '{}');
      if (assistantAuth[username] && assistantAuth[username].name) {
        failureName = assistantAuth[username].name;
      }
    }
    addAccessLog(username, '로그인', '실패', failureName);
  }

  // 🔥 함수 종료 전 백엔드 토큰이 덮어씌워졌는지 확인 및 복원
  const tokenAfterCheck = localStorage.getItem('adminToken');
  if (isBackendToken && tokenAfterCheck !== existingToken) {
    console.error('[auth.js] ❌ 백엔드 토큰이 변경되었습니다! 복원합니다.');
    console.error('[auth.js] 원래 토큰:', existingToken.substring(0, 30) + '...', `(길이: ${existingToken.length})`);
    console.error('[auth.js] 변경된 토큰:', tokenAfterCheck ? tokenAfterCheck.substring(0, 30) + '...' : '없음', tokenAfterCheck ? `(길이: ${tokenAfterCheck.length})` : '');
    localStorage.setItem('adminToken', existingToken);
    console.log('[auth.js] ✅ 백엔드 토큰으로 복원 완료');
  }

  return loginSuccess;
};

// 로그아웃 처리
export const logout = () => {
  const username = localStorage.getItem('adminUsername');
  const adminType = localStorage.getItem('adminType');
  
  // 이름 찾기
  let name = '';
  if (adminType === 'main') {
    name = '관리자';
  } else if (adminType === 'assistant') {
    const assistantAuth = JSON.parse(localStorage.getItem('assistantAuth') || '{}');
    if (assistantAuth[username]) {
      name = assistantAuth[username].name || username;
    } else {
      const assistantManagers = JSON.parse(localStorage.getItem('assistantManagers') || '[]');
      const assistant = assistantManagers.find(a => a.userId === username);
      name = assistant ? assistant.name : username;
    }
  }
  
  // 로그아웃 기록
  if (username) {
    addAccessLog(username, '로그아웃', '-', name);
  }
  
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUsername');
  localStorage.removeItem('adminType');
};

// 로컬 토큰 감지 함수
const isLocalToken = (token) => {
  if (!token) return false;
  // 백엔드 JWT 토큰은 400자 이상이고 eyJ로 시작
  // 로컬 토큰은 짧고 base64 인코딩된 username:timestamp 형태
  return token.length < 400 || !token.startsWith('eyJ');
};

// 로컬 토큰이 있으면 제거하는 함수
export const removeLocalTokenIfPresent = () => {
  const token = localStorage.getItem('adminToken');
  if (token && isLocalToken(token)) {
    console.warn('[auth.js] ⚠️ 로컬 토큰이 감지되어 제거합니다.');
    console.warn('[auth.js] 로컬 토큰:', token.substring(0, 50), `(길이: ${token.length})`);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminType');
    return true; // 로컬 토큰이 제거되었음을 알림
  }
  return false;
};

// 로그인 여부 확인 (백엔드 토큰만 허용)
export const isAuthenticated = () => {
  // 먼저 로컬 토큰이 있으면 제거
  if (removeLocalTokenIfPresent()) {
    return false;
  }
  
  const token = localStorage.getItem('adminToken');
  if (!token) return false;
  
  // 로컬 토큰이면 제거하고 false 반환 (이중 체크)
  if (isLocalToken(token)) {
    console.warn('[auth.js] 로컬 토큰이 감지되었습니다. 제거합니다.');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminType');
    return false;
  }
  
  return true;
};

// 현재 사용자 정보 가져오기
export const getCurrentUser = () => {
  return localStorage.getItem('adminUsername');
};


