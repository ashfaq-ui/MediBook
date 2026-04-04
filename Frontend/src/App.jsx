import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/patient/PatientDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/patient/dashboard" element={
                    <ProtectedRoute allowedRole="PATIENT">
                        <PatientDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/doctor/dashboard" element={
                    <ProtectedRoute allowedRole="DOCTOR">
                        <DoctorDashboard />
                    </ProtectedRoute>
                } />
            </Routes>
        </BrowserRouter>
    );
}

export default App;