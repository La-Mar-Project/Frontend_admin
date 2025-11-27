import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { isAuthenticated, removeLocalTokenIfPresent } from '../utils/auth';

function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  
  // 컴포넌트 마운트 시 로컬 토큰 확인 및 제거
  useEffect(() => {
    if (removeLocalTokenIfPresent()) {
      console.warn('[ProtectedRoute] 로컬 토큰이 감지되어 제거했습니다. 로그인 페이지로 이동합니다.');
      navigate('/login', { replace: true });
    }
  }, [navigate]);
  
  if (!isAuthenticated()) {
    // 로그인되어 있지 않으면 로그인 페이지로 리다이렉트
    return <Navigate to="/login" replace />;
  }

  // 로그인되어 있으면 자식 컴포넌트 렌더링
  return children;
}

export default ProtectedRoute;


