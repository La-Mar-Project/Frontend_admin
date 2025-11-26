import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
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
  return (
    <Router>
      <Routes>
        {/* 로그인 페이지 */}
        <Route path="/login" element={<Login />} />
        
        {/* 루트 경로: 로그인 여부에 따라 리다이렉트 */}
        <Route 
          path="/" 
          element={
            isAuthenticated() ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />
          } 
        />
        
        {/* 보호된 라우트들 */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
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
