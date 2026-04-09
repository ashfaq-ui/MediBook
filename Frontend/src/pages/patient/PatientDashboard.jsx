import { useState, useEffect } from 'react';
import api from '../../api/axios';
import BookAppointment from './BookAppointment';

function PatientDashboard() {
    const name = localStorage.getItem('name');
    const patientId = localStorage.getItem('userId');
    const [appointments, setAppointments] = useState([]);
    const [showBooking, setShowBooking] = useState(false);
    const [activeTab, setActiveTab] = useState('all');

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
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
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

    const filteredAppointments = activeTab === 'all' ? appointments
        : activeTab === 'upcoming' ? upcoming
        : activeTab === 'completed' ? completed
        : cancelled;

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

                .pd-wrapper {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    background: #0F172A;
                    min-height: 100vh;
                }

                .pd-navbar {
                    background: #1E293B;
                    border-bottom: 1px solid #334155;
                    padding: 16px 32px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                }

                .pd-navbar-brand {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #F1F5F9;
                    font-size: 20px;
                    font-weight: bold;
                }

                .pd-navbar-right {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .pd-navbar-name {
                    color: #94A3B8;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .pd-logout-btn {
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

                .pd-logout-btn:hover { background: rgba(255,255,255,0.12); }

                .pd-content { padding: 32px; max-width: 1200px; margin: 0 auto; }

                .pd-welcome {
                    margin-bottom: 24px;
                }

                .pd-welcome h2 {
                    font-size: 24px;
                    color: #F1F5F9;
                    font-weight: 700;
                }

                .pd-welcome p {
                    color: #64748B;
                    font-size: 14px;
                    margin-top: 4px;
                }

                .pd-stats {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                    margin-bottom: 28px;
                }

                .pd-stat-card {
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

                .pd-stat-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #64748B;
                    margin-bottom: 6px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .pd-stat-value {
                    font-size: 32px;
                    font-weight: 700;
                }

                .pd-stat-icon {
                    font-size: 32px;
                    opacity: 0.2;
                }

                .pd-book-btn {
                    background: #0D9488;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                    margin-bottom: 24px;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: 0 4px 12px rgba(13,148,136,0.25);
                    transition: all 0.2s;
                }

                .pd-book-btn:hover {
                    background: #0F766E;
                    transform: translateY(-1px);
                }

                .pd-tabs {
                    display: flex;
                    gap: 4px;
                    background: #1E293B;
                    border: 1px solid #334155;
                    padding: 4px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    width: fit-content;
                }

                .pd-tab {
                    padding: 8px 18px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 600;
                    transition: all 0.2s;
                    background: transparent;
                    color: #64748B;
                }

                .pd-tab.active {
                    background: #263347;
                    color: #2DD4BF;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.3);
                }

                .pd-table-wrapper {
                    background: #1E293B;
                    border: 1px solid #334155;
                    border-radius: 12px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                    overflow: hidden;
                }

                .pd-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .pd-table th {
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

                .pd-table td {
                    padding: 14px 16px;
                    font-size: 14px;
                    color: #CBD5E1;
                    border-bottom: 1px solid #263347;
                }

                .pd-table tr:last-child td { border-bottom: none; }
                .pd-table tr:hover td { background: #263347; }

                .pd-badge {
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    display: inline-block;
                }

                .pd-cancel-btn {
                    background: rgba(239,68,68,0.15);
                    color: #FCA5A5;
                    border: 1px solid rgba(239,68,68,0.25);
                    padding: 6px 14px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 600;
                    transition: background 0.2s;
                }

                .pd-cancel-btn:hover { background: rgba(239,68,68,0.25); }

                .pd-empty {
                    text-align: center;
                    padding: 48px 20px;
                    color: #475569;
                }

                .pd-empty-icon { font-size: 48px; margin-bottom: 12px; }
                .pd-empty h4 { font-size: 16px; color: #64748B; margin-bottom: 4px; }
                .pd-empty p { font-size: 14px; }

                @media (max-width: 768px) {
                    .pd-navbar { padding: 14px 16px; }
                    .pd-navbar-brand { font-size: 17px; }
                    .pd-navbar-name { display: none; }
                    .pd-content { padding: 16px; }
                    .pd-stats { grid-template-columns: 1fr; gap: 10px; }
                    .pd-tabs { width: 100%; justify-content: space-between; }
                    .pd-tab { flex: 1; text-align: center; padding: 8px 8px; font-size: 12px; }
                    .pd-table th, .pd-table td { padding: 10px 10px; font-size: 12px; }
                }
            `}</style>

            <div className="pd-wrapper">
                {/* Navbar */}
                <nav className="pd-navbar">
                    <div className="pd-navbar-brand">
                        🏥 MediBook
                    </div>
                    <div className="pd-navbar-right">
                        <span className="pd-navbar-name">👤 {name}</span>
                        <button className="pd-logout-btn" onClick={handleLogout}>
                            Sign Out
                        </button>
                    </div>
                </nav>

                <div className="pd-content">
                    {/* Welcome */}
                    <div className="pd-welcome">
                        <h2>Hello, {name}! 👋</h2>
                        <p>Manage your appointments and health records</p>
                    </div>

                    {/* Stats */}
                    <div className="pd-stats">
                        <div className="pd-stat-card" style={{ borderColor: '#0D9488' }}>
                            <div>
                                <div className="pd-stat-label">Upcoming</div>
                                <div className="pd-stat-value" style={{ color: '#0D9488' }}>{upcoming.length}</div>
                            </div>
                            <div className="pd-stat-icon">📅</div>
                        </div>
                        <div className="pd-stat-card" style={{ borderColor: '#3B82F6' }}>
                            <div>
                                <div className="pd-stat-label">Completed</div>
                                <div className="pd-stat-value" style={{ color: '#3B82F6' }}>{completed.length}</div>
                            </div>
                            <div className="pd-stat-icon">✅</div>
                        </div>
                        <div className="pd-stat-card" style={{ borderColor: '#EF4444' }}>
                            <div>
                                <div className="pd-stat-label">Cancelled</div>
                                <div className="pd-stat-value" style={{ color: '#EF4444' }}>{cancelled.length}</div>
                            </div>
                            <div className="pd-stat-icon">❌</div>
                        </div>
                    </div>

                    {/* Book Button */}
                    <button
                        className="pd-book-btn"
                        onClick={() => setShowBooking(!showBooking)}>
                        {showBooking ? '✕ Close' : '+ Book New Appointment'}
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

                    {/* Tabs */}
                    <div className="pd-tabs">
                        {[
                            { key: 'all', label: `All (${appointments.length})` },
                            { key: 'upcoming', label: `Upcoming (${upcoming.length})` },
                            { key: 'completed', label: `Completed (${completed.length})` },
                            { key: 'cancelled', label: `Cancelled (${cancelled.length})` },
                        ].map(t => (
                            <button
                                key={t.key}
                                className={`pd-tab ${activeTab === t.key ? 'active' : ''}`}
                                onClick={() => setActiveTab(t.key)}>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="pd-table-wrapper">
                        {filteredAppointments.length === 0 ? (
                            <div className="pd-empty">
                                <div className="pd-empty-icon">📋</div>
                                <h4>No appointments found</h4>
                                <p>Book your first appointment to get started</p>
                            </div>
                        ) : (
                            <table className="pd-table">
                                <thead>
                                    <tr>
                                        <th>Doctor</th>
                                        <th>Department</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAppointments.map(a => (
                                        <tr key={a.id}>
                                            <td>
                                                <div style={{ fontWeight: 600, color: '#F1F5F9' }}>Dr. {a.doctorName}</div>
                                            </td>
                                            <td style={{ color: '#64748B' }}>{a.departmentName}</td>
                                            <td>{a.date}</td>
                                            <td style={{ color: '#64748B' }}>{a.startTime} - {a.endTime}</td>
                                            <td>
                                                <span className="pd-badge" style={statusStyle(a.status)}>
                                                    {a.status}
                                                </span>
                                            </td>
                                            <td>
                                                {(a.status === 'PENDING' || a.status === 'CONFIRMED') && (
                                                    <button
                                                        className="pd-cancel-btn"
                                                        onClick={() => handleCancel(a.id)}>
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
            </div>
        </>
    );
}

export default PatientDashboard;