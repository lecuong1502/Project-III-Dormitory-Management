import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import StudentHome from './pages/student/Home';
import RoomInfo from './pages/student/RoomInfo';
import StudentRegistration from './pages/student/Registration';
import StudentBilling from './pages/student/Billing';
import StudentRequests from './pages/student/Requests';
import StudentNotifications from './pages/student/Notifications';
import AdminDashboard from './pages/admin/Dashboard';
import AdminRooms from './pages/admin/Rooms';
import AdminRegistrations from './pages/admin/Registrations';
import AdminBilling from './pages/admin/Billing';
import AdminRequests from './pages/admin/Requests';
import AdminNotifications from './pages/admin/Notifications';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route element={<ProtectedRoute role="student"><MainLayout /></ProtectedRoute>}>
            <Route path="/student/home" element={<StudentHome />} />
            <Route path="/student/room" element={<RoomInfo />} />
            <Route path="/student/registration" element={<StudentRegistration />} />
            <Route path="/student/billing" element={<StudentBilling />} />
            <Route path="/student/requests" element={<StudentRequests />} />
            <Route path="/student/notifications" element={<StudentNotifications />} />
          </Route>
          <Route element={<ProtectedRoute role="admin"><MainLayout /></ProtectedRoute>}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/rooms" element={<AdminRooms />} />
            <Route path="/admin/registrations" element={<AdminRegistrations />} />
            <Route path="/admin/billing" element={<AdminBilling />} />
            <Route path="/admin/requests" element={<AdminRequests />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
}

export default App;