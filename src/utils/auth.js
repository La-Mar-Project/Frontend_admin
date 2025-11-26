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
  // 기존 백엔드 토큰 보호 (덮어쓰기 방지)
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
  
  // 함수 종료 전 백엔드 토큰이 덮어씌워졌는지 확인 및 복원
  const tokenAfterCheck = localStorage.getItem('adminToken');
  if (isBackendToken && tokenAfterCheck !== existingToken) {
    console.warn('[auth.js] ⚠️ 백엔드 토큰이 변경되었습니다. 복원합니다.');
    localStorage.setItem('adminToken', existingToken);
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

// 로그인 여부 확인
export const isAuthenticated = () => {
  const token = localStorage.getItem('adminToken');
  return !!token;
};

// 현재 사용자 정보 가져오기
export const getCurrentUser = () => {
  return localStorage.getItem('adminUsername');
};


