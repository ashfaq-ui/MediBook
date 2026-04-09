import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import ManageSlots from './ManageSlots';

function DoctorDashboard() {
    const navigate = useNavigate();
    const name = localStorage.getItem('name');
    const [doctorId, setDoctorId] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [tab, setTab] = useState('appointments');

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
        navigate('/login');
    };

    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.date === today);
    const pending = appointments.filter(a => a.status === 'PENDING');
    const completed = appointments.filter(a => a.status === 'COMPLETED');

    const statusStyle = (status) => {
        const styles = {
            PENDING:   { background: 'rgba(234,179,8,0.15)',   color: '#FCD34D', border: '1px solid rgba(234,179,8,0.25)' },
            CONFIRMED: { background: 'rgba(34,197,94,0.15)',   color: '#86EFAC', border: '1px solid rgba(34,197,94,0.25)' },
            CANCELLED: { background: 'rgba(239,68,68,0.15)',   color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.25)' },
            COMPLETED: { background: 'rgba(59,130,246,0.15)',  color: '#93C5FD', border: '1px solid rgba(59,130,246,0.25)' },
        };
        return styles[status] || {};
    };

    return (
        <>
            <style>{`
                * { box-sizing: border-box; margin: 0; padding: 0; }

                .dd-wrapper {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    background: #0F172A;
                    min-height: 100vh;
                }

                .dd-navbar {
                    background: #1E293B;
                    border-bottom: 1px solid #334155;
                    padding: 16px 32px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                }

                .dd-navbar-brand {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #F1F5F9;
                    font-size: 20px;
                    font-weight: bold;
                }

                .dd-navbar-right {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .dd-navbar-name {
                    color: #94A3B8;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .dd-logout-btn {
                    background: rgba(255,255,255,0.07);
                    color: #CBD5E1;
                    border: 1px solid #334155;
                    padding: 8px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 600;
                    transition: background 0.2s;
                }

                .dd-logout-btn:hover { background: rgba(255,255,255,0.12); }

                .dd-content { padding: 32px; max-width: 1200px; margin: 0 auto; }

                .dd-welcome { margin-bottom: 24px; }
                .dd-welcome h2 { font-size: 24px; color: #F1F5F9; font-weight: 700; }
                .dd-welcome p { color: #64748B; font-size: 14px; margin-top: 4px; }

                .dd-stats {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                    margin-bottom: 28px;
                }

                .dd-stat-card {
                    background: #1E293B;
                    border: 1px solid #334155;
                    border-radius: 12px;
                    padding: 20px 24px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                    border-left: 4px solid;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .dd-stat-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #64748B;
                    margin-bottom: 6px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .dd-stat-value { font-size: 32px; font-weight: 700; }
                .dd-stat-icon { font-size: 32px; opacity: 0.2; }

                .dd-tabs {
                    display: flex;
                    gap: 4px;
                    background: #1E293B;
                    border: 1px solid #334155;
                    padding: 4px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    width: fit-content;
                }

                .dd-tab {
                    padding: 8px 20px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 600;
                    transition: all 0.2s;
                    background: transparent;
                    color: #64748B;
                }

                .dd-tab.active {
                    background: #263347;
                    color: #93C5FD;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.3);
                }

                .dd-table-wrapper {
                    background: #1E293B;
                    border: 1px solid #334155;
                    border-radius: 12px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                    overflow: hidden;
                }

                .dd-table { width: 100%; border-collapse: collapse; }

                .dd-table th {
                    padding: 14px 16px;
                    text-align: left;
                    font-size: 12px;
                    font-weight: 700;
                    color: #64748B;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    background: #162032;
                    border-bottom: 1px solid #334155;
                }

                .dd-table td {
                    padding: 14px 16px;
                    font-size: 14px;
                    color: #CBD5E1;
                    border-bottom: 1px solid #263347;
                }

                .dd-table tr:last-child td { border-bottom: none; }
                .dd-table tr:hover td { background: #263347; }

                .dd-badge {
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    display: inline-block;
                }

                .dd-action-btn {
                    padding: 6px 14px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 600;
                    transition: opacity 0.2s;
                }

                .dd-action-btn:hover { opacity: 0.85; }

                .dd-empty {
                    text-align: center;
                    padding: 48px 20px;
                    color: #475569;
                }

                .dd-empty-icon { font-size: 48px; margin-bottom: 12px; }
                .dd-empty h4 { font-size: 16px; color: #64748B; margin-bottom: 4px; }
                .dd-empty p { font-size: 14px; }

                @media (max-width: 768px) {
                    .dd-navbar { padding: 14px 16px; }
                    .dd-navbar-name { display: none; }
                    .dd-content { padding: 16px; }
                    .dd-stats { grid-template-columns: 1fr; gap: 10px; }
                    .dd-tabs { width: 100%; }
                    .dd-tab { flex: 1; text-align: center; padding: 8px; font-size: 12px; }
                    .dd-table th, .dd-table td { padding: 10px; font-size: 12px; }
                }
            `}</style>

            <div className="dd-wrapper">
                {/* Navbar */}
                <nav className="dd-navbar">
                    <div className="dd-navbar-brand">🏥 MediBook</div>
                    <div className="dd-navbar-right">
                        <span className="dd-navbar-name">👨‍⚕️ Dr. {name}</span>
                        <button className="dd-logout-btn" onClick={handleLogout}>
                            Sign Out
                        </button>
                    </div>
                </nav>

                <div className="dd-content">
                    {/* Welcome */}
                    <div className="dd-welcome">
                        <h2>Welcome, Dr. {name}! 👋</h2>
                        <p>Manage your appointments and availability</p>
                    </div>

                    {/* Stats */}
                    <div className="dd-stats">
                        <div className="dd-stat-card" style={{ borderColor: '#1D4ED8' }}>
                            <div>
                                <div className="dd-stat-label">Today's</div>
                                <div className="dd-stat-value" style={{ color: '#1D4ED8' }}>
                                    {todayAppointments.length}
                                </div>
                            </div>
                            <div className="dd-stat-icon">📅</div>
                        </div>
                        <div className="dd-stat-card" style={{ borderColor: '#F59E0B' }}>
                            <div>
                                <div className="dd-stat-label">Pending</div>
                                <div className="dd-stat-value" style={{ color: '#F59E0B' }}>
                                    {pending.length}
                                </div>
                            </div>
                            <div className="dd-stat-icon">⏳</div>
                        </div>
                        <div className="dd-stat-card" style={{ borderColor: '#10B981' }}>
                            <div>
                                <div className="dd-stat-label">Completed</div>
                                <div className="dd-stat-value" style={{ color: '#10B981' }}>
                                    {completed.length}
                                </div>
                            </div>
                            <div className="dd-stat-icon">✅</div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="dd-tabs">
                        <button
                            className={`dd-tab ${tab === 'appointments' ? 'active' : ''}`}
                            onClick={() => setTab('appointments')}>
                            📅 Appointments
                        </button>
                        <button
                            className={`dd-tab ${tab === 'slots' ? 'active' : ''}`}
                            onClick={() => setTab('slots')}>
                            🗓 Manage Slots
                        </button>
                    </div>

                    {/* Appointments Tab */}
                    {tab === 'appointments' && (
                        <div className="dd-table-wrapper">
                            {appointments.length === 0 ? (
                                <div className="dd-empty">
                                    <div className="dd-empty-icon">📋</div>
                                    <h4>No appointments yet</h4>
                                    <p>Your appointments will appear here</p>
                                </div>
                            ) : (
                                <table className="dd-table">
                                    <thead>
                                        <tr>
                                            <th>Patient</th>
                                            <th>Date</th>
                                            <th>Time</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {appointments.map(a => (
                                            <tr key={a.id}>
                                                <td>
                                                    <div style={{ fontWeight: 600, color: '#F1F5F9' }}>{a.patientName}</div>
                                                </td>
                                                <td>{a.date}</td>
                                                <td style={{ color: '#64748B' }}>
                                                    {a.startTime} - {a.endTime}
                                                </td>
                                                <td>
                                                    <span className="dd-badge" style={statusStyle(a.status)}>
                                                        {a.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        {a.status === 'PENDING' && (
                                                            <button
                                                                className="dd-action-btn"
                                                                style={{ background: 'rgba(34,197,94,0.15)', color: '#86EFAC', border: '1px solid rgba(34,197,94,0.25)' }}
                                                                onClick={() => handleStatusUpdate(a.id, 'CONFIRMED')}>
                                                                ✓ Confirm
                                                            </button>
                                                        )}
                                                        {a.status === 'CONFIRMED' && (
                                                            <button
                                                                className="dd-action-btn"
                                                                style={{ background: 'rgba(59,130,246,0.15)', color: '#93C5FD', border: '1px solid rgba(59,130,246,0.25)' }}
                                                                onClick={() => handleStatusUpdate(a.id, 'COMPLETED')}>
                                                                ✓ Complete
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
                    )}

                    {/* Slots Tab */}
                    {tab === 'slots' && doctorId && (
                        <ManageSlots doctorId={doctorId} />
                    )}
                </div>
            </div>
        </>
    );
}

export default DoctorDashboard;