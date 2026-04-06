import { useState, useEffect } from 'react';
import api from '../../api/axios';

function DoctorDashboard() {
    const name = localStorage.getItem('name');
    const userId = localStorage.getItem('userId');
    const [doctorId, setDoctorId] = useState(null);
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        fetchDoctorId();
    }, []);

    useEffect(() => {
        if (doctorId) fetchAppointments();
    }, [doctorId]);

    const fetchDoctorId = async () => {
        try {
            const res = await api.get('/doctors');
            const doctor = res.data.find(d => d.email === localStorage.getItem('email'));
            if (doctor) setDoctorId(doctor.id);
        } catch (err) {
            console.error('Failed to fetch doctor', err);
        }
    };

    const fetchAppointments = async () => {
        try {
            const res = await api.get(`/appointments/doctor/${doctorId}`);
            setAppointments(res.data);
        } catch (err) {
            console.error('Failed to fetch appointments', err);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.patch(`/appointments/${id}/status?status=${status}`);
            fetchAppointments();
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.date === today);
    const pending = appointments.filter(a => a.status === 'PENDING');
    const completed = appointments.filter(a => a.status === 'COMPLETED');

    return (
        <div style={{ fontFamily: 'sans-serif', background: '#F8FAFC', minHeight: '100vh' }}>
            {/* Navbar */}
            <div style={{
                background: '#1D4ED8', padding: '16px 32px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <h2 style={{ color: 'white', margin: 0 }}>🏥 MediBook</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ color: 'white' }}>👨‍⚕️ Dr. {name}</span>
                    <button onClick={handleLogout} style={{
                        background: 'white', color: '#1D4ED8', border: 'none',
                        padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
                    }}>Logout</button>
                </div>
            </div>

            <div style={{ padding: '32px' }}>
                <h3>Welcome, Dr. {name}! 👋</h3>

                {/* Stats Cards */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                    <div style={{
                        background: '#EFF6FF', border: '1px solid #93C5FD',
                        borderRadius: '8px', padding: '20px', flex: 1
                    }}>
                        <p style={{ margin: 0, color: '#2563EB', fontWeight: 'bold' }}>Today's</p>
                        <h2 style={{ margin: '8px 0', color: '#1D4ED8' }}>{todayAppointments.length}</h2>
                        <p style={{ margin: 0, color: '#64748B' }}>Appointments</p>
                    </div>
                    <div style={{
                        background: '#FFF7ED', border: '1px solid #FCD34D',
                        borderRadius: '8px', padding: '20px', flex: 1
                    }}>
                        <p style={{ margin: 0, color: '#D97706', fontWeight: 'bold' }}>Pending</p>
                        <h2 style={{ margin: '8px 0', color: '#B45309' }}>{pending.length}</h2>
                        <p style={{ margin: 0, color: '#64748B' }}>Appointments</p>
                    </div>
                    <div style={{
                        background: '#F0FDF4', border: '1px solid #86EFAC',
                        borderRadius: '8px', padding: '20px', flex: 1
                    }}>
                        <p style={{ margin: 0, color: '#16A34A', fontWeight: 'bold' }}>Completed</p>
                        <h2 style={{ margin: '8px 0', color: '#15803D' }}>{completed.length}</h2>
                        <p style={{ margin: 0, color: '#64748B' }}>Appointments</p>
                    </div>
                </div>

                {/* Appointments Table */}
                <h4>All Appointments</h4>
                {appointments.length === 0 ? (
                    <div style={{
                        background: 'white', borderRadius: '8px',
                        border: '1px solid #E2E8F0', padding: '20px',
                        textAlign: 'center', color: '#64748B'
                    }}>
                        No appointments yet.
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px' }}>
                        <thead>
                            <tr style={{ background: '#F1F5F9' }}>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Patient</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Time</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map(a => (
                                <tr key={a.id} style={{ borderTop: '1px solid #E2E8F0' }}>
                                    <td style={{ padding: '12px' }}>{a.patientName}</td>
                                    <td style={{ padding: '12px' }}>{a.date}</td>
                                    <td style={{ padding: '12px' }}>{a.startTime} - {a.endTime}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                                            background: a.status === 'PENDING' ? '#FEF9C3' : a.status === 'CONFIRMED' ? '#DCFCE7' : a.status === 'CANCELLED' ? '#FEE2E2' : '#DBEAFE',
                                            color: a.status === 'PENDING' ? '#854D0E' : a.status === 'CONFIRMED' ? '#166534' : a.status === 'CANCELLED' ? '#991B1B' : '#1E40AF'
                                        }}>
                                            {a.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {a.status === 'PENDING' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(a.id, 'CONFIRMED')}
                                                    style={{
                                                        background: '#10B981', color: 'white', border: 'none',
                                                        padding: '6px 12px', borderRadius: '6px', cursor: 'pointer'
                                                    }}>
                                                    Confirm
                                                </button>
                                            )}
                                            {a.status === 'CONFIRMED' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(a.id, 'COMPLETED')}
                                                    style={{
                                                        background: '#3B82F6', color: 'white', border: 'none',
                                                        padding: '6px 12px', borderRadius: '6px', cursor: 'pointer'
                                                    }}>
                                                    Complete
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default DoctorDashboard;