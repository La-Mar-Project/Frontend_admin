import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Login from './pages/Login';
import CompanyInfo from './pages/CompanyInfo';
import Dashboard from './pages/Dashboard';
import AssistantManager from './pages/AssistantManager';
import AdminLog from './pages/AdminLog';
import ShipInfo from './pages/ShipInfo';
import ReservationCalendar from './pages/ReservationCalendar';
import ReservationManagement from './pages/ReservationManagement';
import SMSHistory from './pages/SMSHistory';
import ProtectedRoute from './components/ProtectedRoute';
import { isAuthenticated } from './utils/auth';

function App() {
  // 앱 시작 시 로컬 토큰 자동 제거
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      // 로컬 토큰 감지 (400자 미만이거나 eyJ로 시작하지 않으면 로컬 토큰)
      const isLocal = token.length < 400 || !token.startsWith('eyJ');
      if (isLocal) {
        console.warn('[App] 로컬 토큰이 감지되었습니다. 제거합니다.');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUsername');
        localStorage.removeItem('adminType');
      }
    }
  }, []);
  return (
    <Router>
      <Routes>
        {/* 로그인 페이지 */}
        <Route path="/login" element={<Login />} />
        
        {/* 루트 경로: 로그인 여부에 따라 리다이렉트 */}
        <Route 
          path="/" 
          element={
            isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          } 
        />
        
        {/* 보호된 라우트들 */}
        <Route path="/company-info" element={<ProtectedRoute><CompanyInfo /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/assistant-manager" element={<ProtectedRoute><AssistantManager /></ProtectedRoute>} />
        <Route path="/admin-log" element={<ProtectedRoute><AdminLog /></ProtectedRoute>} />
        <Route path="/ship-info" element={<ProtectedRoute><ShipInfo /></ProtectedRoute>} />
        <Route path="/reservation-calendar" element={<ProtectedRoute><ReservationCalendar /></ProtectedRoute>} />
        <Route path="/reservation-management" element={<ProtectedRoute><ReservationManagement /></ProtectedRoute>} />
        <Route path="/sms-history" element={<ProtectedRoute><SMSHistory /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
