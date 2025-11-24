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

// 로그인 처리
export const login = (username, password) => {
  let name = '';
  let loginSuccess = false;

  // 메인 관리자 계정 확인
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    name = '관리자';
    loginSuccess = true;
    // 로그인 성공 시 토큰을 localStorage에 저장
    const token = btoa(`${username}:${Date.now()}`); // 간단한 토큰 생성
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUsername', username);
    localStorage.setItem('adminType', 'main'); // 메인 관리자 구분
  } else {
    // 보조 관리자 계정 확인
    const assistantAuth = JSON.parse(localStorage.getItem('assistantAuth') || '{}');
    if (assistantAuth[username]) {
      const assistant = assistantAuth[username];
      // 활성화되어 있고 비밀번호가 일치하는 경우
      if (assistant.active === '활성' && assistant.password === password) {
        name = assistant.name || username;
        loginSuccess = true;
        const token = btoa(`${username}:${Date.now()}`);
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminUsername', username);
        localStorage.setItem('adminType', 'assistant'); // 보조 관리자 구분
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


