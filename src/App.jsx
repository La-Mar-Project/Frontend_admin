import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import SMSManagement from './pages/SMSManagement';
import CompanyInfo from './pages/CompanyInfo';
import Dashboard from './pages/Dashboard';
import AssistantManager from './pages/AssistantManager';
import AdminLog from './pages/AdminLog';
import ShipInfo from './pages/ShipInfo';
import ReservationCalendar from './pages/ReservationCalendar';
import ReservationManagement from './pages/ReservationManagement';
import PreReservationCoupon from './pages/PreReservationCoupon';
import SMSHistory from './pages/SMSHistory';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/sms" element={<SMSManagement />} />
        <Route path="/company-info" element={<CompanyInfo />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/assistant-manager" element={<AssistantManager />} />
        <Route path="/admin-log" element={<AdminLog />} />
        <Route path="/ship-info" element={<ShipInfo />} />
        <Route path="/reservation-calendar" element={<ReservationCalendar />} />
        <Route path="/reservation-management" element={<ReservationManagement />} />
        <Route path="/pre-reservation-coupon" element={<PreReservationCoupon />} />
        <Route path="/sms-history" element={<SMSHistory />} />
      </Routes>
    </Router>
  );
}

export default App;
