import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    // 로그인되어 있지 않으면 로그인 페이지로 리다이렉트
    return <Navigate to="/login" replace />;
  }

  // 로그인되어 있으면 자식 컴포넌트 렌더링
  return children;
}

export default ProtectedRoute;


