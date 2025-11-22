// 관리자 계정 정보
const ADMIN_CREDENTIALS = {
  username: 'admin1',
  password: '1111'
};

// 로그인 처리
export const login = (username, password) => {
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    // 로그인 성공 시 토큰을 localStorage에 저장
    const token = btoa(`${username}:${Date.now()}`); // 간단한 토큰 생성
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminUsername', username);
    return true;
  }
  return false;
};

// 로그아웃 처리
export const logout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUsername');
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


