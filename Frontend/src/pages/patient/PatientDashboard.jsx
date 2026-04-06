import { useState, useEffect } from 'react';
import api from '../../api/axios';
import BookAppointment from './BookAppointment';

function PatientDashboard() {
    const name = localStorage.getItem('name');
    const patientId = localStorage.getItem('userId');
    const [appointments, setAppointments] = useState([]);
    const [showBooking, setShowBooking] = useState(false);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await api.get(`/appointments/patient/${patientId}`);
            setAppointments(res.data);
        } catch (err) {
            console.error('Failed to fetch appointments', err);
        }
    };

    const handleCancel = async (id) => {
        try {
            await api.patch(`/appointments/${id}/cancel`);
            fetchAppointments();
        } catch (err) {
            console.error('Failed to cancel', err);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    const upcoming = appointments.filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED');
    const completed = appointments.filter(a => a.status === 'COMPLETED');
    const cancelled = appointments.filter(a => a.status === 'CANCELLED');

    return (
        <div style={{ fontFamily: 'sans-serif', background: '#F8FAFC', minHeight: '100vh' }}>
            {/* Navbar */}
            <div style={{
                background: '#0D9488', padding: '16px 32px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <h2 style={{ color: 'white', margin: 0 }}>🏥 MediBook</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ color: 'white' }}>👤 {name}</span>
                    <button onClick={handleLogout} style={{
                        background: 'white', color: '#0D9488', border: 'none',
                        padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
                    }}>Logout</button>
                </div>
            </div>

            <div style={{ padding: '32px' }}>
                <h3>Welcome back, {name}! 👋</h3>

                {/* Stats Cards */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                    <div style={{
                        background: '#F0FDF4', border: '1px solid #86EFAC',
                        borderRadius: '8px', padding: '20px', flex: 1
                    }}>
                        <p style={{ margin: 0, color: '#16A34A', fontWeight: 'bold' }}>Upcoming</p>
                        <h2 style={{ margin: '8px 0', color: '#15803D' }}>{upcoming.length}</h2>
                        <p style={{ margin: 0, color: '#64748B' }}>Appointments</p>
                    </div>
                    <div style={{
                        background: '#EFF6FF', border: '1px solid #93C5FD',
                        borderRadius: '8px', padding: '20px', flex: 1
                    }}>
                        <p style={{ margin: 0, color: '#2563EB', fontWeight: 'bold' }}>Completed</p>
                        <h2 style={{ margin: '8px 0', color: '#1D4ED8' }}>{completed.length}</h2>
                        <p style={{ margin: 0, color: '#64748B' }}>Appointments</p>
                    </div>
                    <div style={{
                        background: '#FFF7ED', border: '1px solid #FCD34D',
                        borderRadius: '8px', padding: '20px', flex: 1
                    }}>
                        <p style={{ margin: 0, color: '#D97706', fontWeight: 'bold' }}>Cancelled</p>
                        <h2 style={{ margin: '8px 0', color: '#B45309' }}>{cancelled.length}</h2>
                        <p style={{ margin: 0, color: '#64748B' }}>Appointments</p>
                    </div>
                </div>

                {/* Book Button */}
                <button
                    onClick={() => setShowBooking(!showBooking)}
                    style={{
                        background: '#0D9488', color: 'white', border: 'none',
                        padding: '12px 24px', borderRadius: '8px', cursor: 'pointer',
                        fontSize: '16px', marginBottom: '24px'
                    }}>
                    {showBooking ? '✕ Close Booking' : '+ Book New Appointment'}
                </button>

                {/* Booking Form */}
                {showBooking && (
                    <BookAppointment
                        patientId={patientId}
                        onBooked={() => {
                            setShowBooking(false);
                            fetchAppointments();
                        }}
                    />
                )}

                {/* Appointments Table */}
                <h4>My Appointments</h4>
                {appointments.length === 0 ? (
                    <div style={{
                        background: 'white', borderRadius: '8px',
                        border: '1px solid #E2E8F0', padding: '20px',
                        textAlign: 'center', color: '#64748B'
                    }}>
                        No appointments yet. Book your first appointment!
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px' }}>
                        <thead>
                            <tr style={{ background: '#F1F5F9' }}>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Doctor</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Department</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Time</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map(a => (
                                <tr key={a.id} style={{ borderTop: '1px solid #E2E8F0' }}>
                                    <td style={{ padding: '12px' }}>Dr. {a.doctorName}</td>
                                    <td style={{ padding: '12px' }}>{a.departmentName}</td>
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
                                        {(a.status === 'PENDING' || a.status === 'CONFIRMED') && (
                                            <button
                                                onClick={() => handleCancel(a.id)}
                                                style={{
                                                    background: '#EF4444', color: 'white', border: 'none',
                                                    padding: '6px 12px', borderRadius: '6px', cursor: 'pointer'
                                                }}>
                                                Cancel
                                            </button>
                                        )}
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

export default PatientDashboard;