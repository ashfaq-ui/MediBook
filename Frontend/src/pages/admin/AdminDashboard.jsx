import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

function AdminDashboard() {
    const navigate = useNavigate();
    const name = localStorage.getItem('name');
    const [tab, setTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [newDept, setNewDept] = useState({ name: '', description: '' });
    const [newDoctor, setNewDoctor] = useState({ userId: '', departmentId: '', specialization: '', phone: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            const [usersRes, appointmentsRes, deptsRes, doctorsRes] = await Promise.all([
                api.get('/auth/users'),
                api.get('/appointments/all'),
                api.get('/departments'),
                api.get('/doctors')
            ]);
            setUsers(usersRes.data);
            setAppointments(appointmentsRes.data);
            setDepartments(deptsRes.data);
            setDoctors(doctorsRes.data);
        } catch (err) {
            console.error('Failed to fetch data', err);
        }
    };

    const handleAddDoctor = async () => {
        if (!newDoctor.userId || !newDoctor.departmentId || !newDoctor.specialization) {
            return alert('User, department and specialization are required');
        }
        setLoading(true);
        try {
            await api.post('/doctors', {
                userId: parseInt(newDoctor.userId),
                departmentId: parseInt(newDoctor.departmentId),
                specialization: newDoctor.specialization,
                phone: newDoctor.phone
            });
            setNewDoctor({ userId: '', departmentId: '', specialization: '', phone: '' });
            fetchAll();
        } catch (err) {
            alert('Failed to add doctor');
        } finally {
            setLoading(false);
        }
    };

    const handleAddDept = async () => {
        if (!newDept.name) return alert('Department name is required');
        setLoading(true);
        try {
            await api.post('/departments', newDept);
            setNewDept({ name: '', description: '' });
            fetchAll();
        } catch (err) {
            alert('Failed to add department');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const patients = users.filter(u => u.role === 'PATIENT');
    const doctorUsers = users.filter(u => u.role === 'DOCTOR');

    const statusStyle = (status) => {
        const styles = {
            PENDING:   { background: 'rgba(234,179,8,0.15)',   color: '#FCD34D', border: '1px solid rgba(234,179,8,0.25)' },
            CONFIRMED: { background: 'rgba(34,197,94,0.15)',   color: '#86EFAC', border: '1px solid rgba(34,197,94,0.25)' },
            CANCELLED: { background: 'rgba(239,68,68,0.15)',   color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.25)' },
            COMPLETED: { background: 'rgba(59,130,246,0.15)',  color: '#93C5FD', border: '1px solid rgba(59,130,246,0.25)' },
        };
        return styles[status] || {};
    };

    const roleStyle = (role) => {
        const styles = {
            PATIENT: { background: 'rgba(34,197,94,0.15)',  color: '#86EFAC', border: '1px solid rgba(34,197,94,0.25)' },
            DOCTOR:  { background: 'rgba(59,130,246,0.15)', color: '#93C5FD', border: '1px solid rgba(59,130,246,0.25)' },
            ADMIN:   { background: 'rgba(239,68,68,0.15)',  color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.25)' },
        };
        return styles[role] || {};
    };

    const tabs = [
        { key: 'users',        icon: '👥', label: 'Users' },
        { key: 'appointments', icon: '📅', label: 'Appointments' },
        { key: 'departments',  icon: '🏥', label: 'Departments' },
        { key: 'doctors',      icon: '👨‍⚕️', label: 'Doctors' },
    ];

    return (
        <>
            <style>{`
                * { box-sizing: border-box; margin: 0; padding: 0; }

                .ad-wrapper {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    background: #0F172A;
                    min-height: 100vh;
                }

                .ad-navbar {
                    background: #1E293B;
                    border-bottom: 1px solid #334155;
                    padding: 16px 32px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                }

                .ad-navbar-brand {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #F1F5F9;
                    font-size: 20px;
                    font-weight: bold;
                }

                .ad-navbar-badge {
                    background: #0D9488;
                    color: white;
                    font-size: 10px;
                    font-weight: 700;
                    padding: 2px 8px;
                    border-radius: 20px;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                }

                .ad-navbar-right {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .ad-navbar-name {
                    color: #94A3B8;
                    font-size: 14px;
                }

                .ad-logout-btn {
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

                .ad-logout-btn:hover { background: rgba(255,255,255,0.12); }

                .ad-content { padding: 32px; max-width: 1200px; margin: 0 auto; }

                .ad-welcome { margin-bottom: 24px; }
                .ad-welcome h2 { font-size: 24px; color: #F1F5F9; font-weight: 700; }
                .ad-welcome p { color: #64748B; font-size: 14px; margin-top: 4px; }

                .ad-stats {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    margin-bottom: 28px;
                }

                .ad-stat-card {
                    background: #1E293B;
                    border: 1px solid #334155;
                    border-radius: 12px;
                    padding: 20px 24px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                    border-left: 4px solid;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .ad-stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                }

                .ad-stat-label {
                    font-size: 12px;
                    font-weight: 600;
                    color: #64748B;
                    margin-bottom: 6px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .ad-stat-value { font-size: 32px; font-weight: 700; }
                .ad-stat-icon { font-size: 32px; opacity: 0.2; }

                .ad-tabs {
                    display: flex;
                    gap: 4px;
                    background: #1E293B;
                    border: 1px solid #334155;
                    padding: 4px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    width: fit-content;
                }

                .ad-tab {
                    padding: 8px 20px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 600;
                    transition: all 0.2s;
                    background: transparent;
                    color: #64748B;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .ad-tab.active {
                    background: #263347;
                    color: #F1F5F9;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.3);
                }

                .ad-table-wrapper {
                    background: #1E293B;
                    border: 1px solid #334155;
                    border-radius: 12px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                    overflow: hidden;
                }

                .ad-table { width: 100%; border-collapse: collapse; }

                .ad-table th {
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

                .ad-table td {
                    padding: 14px 16px;
                    font-size: 14px;
                    color: #CBD5E1;
                    border-bottom: 1px solid #263347;
                }

                .ad-table tr:last-child td { border-bottom: none; }
                .ad-table tr:hover td { background: #263347; }

                .ad-badge {
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    display: inline-block;
                }

                .ad-add-dept {
                    background: #162032;
                    border: 1px solid #334155;
                    border-radius: 10px;
                    padding: 20px;
                    margin-bottom: 20px;
                }

                .ad-add-dept h4 {
                    font-size: 14px;
                    font-weight: 700;
                    color: #F1F5F9;
                    margin-bottom: 14px;
                }

                .ad-add-dept-form {
                    display: grid;
                    grid-template-columns: 1fr 2fr auto;
                    gap: 12px;
                    align-items: center;
                }

                .ad-input {
                    padding: 10px 14px;
                    border-radius: 8px;
                    border: 1.5px solid #334155;
                    font-size: 14px;
                    outline: none;
                    transition: border-color 0.2s;
                    background: #0F172A;
                    color: #F1F5F9;
                }

                .ad-input::placeholder { color: #475569; }
                .ad-input:focus { border-color: #0D9488; }

                .ad-add-btn {
                    background: #0D9488;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 600;
                    white-space: nowrap;
                    transition: background 0.2s;
                }

                .ad-add-btn:hover { background: #0F766E; }
                .ad-add-btn:disabled { background: #334155; color: #64748B; cursor: not-allowed; }

                .ad-empty {
                    text-align: center;
                    padding: 48px 20px;
                    color: #475569;
                }

                .ad-select {
                    padding: 10px 14px;
                    border-radius: 8px;
                    border: 1.5px solid #334155;
                    font-size: 14px;
                    outline: none;
                    transition: border-color 0.2s;
                    background: #0F172A;
                    color: #F1F5F9;
                    width: 100%;
                }

                .ad-select:focus { border-color: #0D9488; }

                .ad-add-doctor-form {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr 1fr auto;
                    gap: 12px;
                    align-items: flex-end;
                }

                @media (max-width: 1024px) {
                    .ad-add-doctor-form { grid-template-columns: 1fr 1fr; }
                }

                @media (max-width: 768px) {
                    .ad-add-doctor-form { grid-template-columns: 1fr; }
                }

                @media (max-width: 1024px) {
                    .ad-stats { grid-template-columns: repeat(2, 1fr); }
                }

                @media (max-width: 768px) {
                    .ad-navbar { padding: 14px 16px; }
                    .ad-navbar-name { display: none; }
                    .ad-content { padding: 16px; }
                    .ad-stats { grid-template-columns: repeat(2, 1fr); gap: 10px; }
                    .ad-tabs { width: 100%; overflow-x: auto; }
                    .ad-tab { padding: 8px 12px; font-size: 12px; }
                    .ad-table th, .ad-table td { padding: 10px; font-size: 12px; }
                    .ad-add-dept-form { grid-template-columns: 1fr; }
                }
            `}</style>

            <div className="ad-wrapper">
                {/* Navbar */}
                <nav className="ad-navbar">
                    <div className="ad-navbar-brand">
                        🏥 MediBook
                        <span className="ad-navbar-badge">Admin</span>
                    </div>
                    <div className="ad-navbar-right">
                        <span className="ad-navbar-name">🛡️ {name}</span>
                        <button className="ad-logout-btn" onClick={handleLogout}>
                            Sign Out
                        </button>
                    </div>
                </nav>

                <div className="ad-content">
                    {/* Welcome */}
                    <div className="ad-welcome">
                        <h2>Admin Dashboard</h2>
                        <p>Manage users, appointments, departments and doctors</p>
                    </div>

                    {/* Stats — clickable to switch tabs */}
                    <div className="ad-stats">
                        <div className="ad-stat-card"
                            style={{ borderColor: '#3B82F6' }}
                            onClick={() => setTab('users')}>
                            <div>
                                <div className="ad-stat-label">Patients</div>
                                <div className="ad-stat-value" style={{ color: '#3B82F6' }}>
                                    {patients.length}
                                </div>
                            </div>
                            <div className="ad-stat-icon">🧑‍⚕️</div>
                        </div>
                        <div className="ad-stat-card"
                            style={{ borderColor: '#10B981' }}
                            onClick={() => setTab('doctors')}>
                            <div>
                                <div className="ad-stat-label">Doctors</div>
                                <div className="ad-stat-value" style={{ color: '#10B981' }}>
                                    {doctorUsers.length}
                                </div>
                            </div>
                            <div className="ad-stat-icon">👨‍⚕️</div>
                        </div>
                        <div className="ad-stat-card"
                            style={{ borderColor: '#F59E0B' }}
                            onClick={() => setTab('departments')}>
                            <div>
                                <div className="ad-stat-label">Departments</div>
                                <div className="ad-stat-value" style={{ color: '#F59E0B' }}>
                                    {departments.length}
                                </div>
                            </div>
                            <div className="ad-stat-icon">🏥</div>
                        </div>
                        <div className="ad-stat-card"
                            style={{ borderColor: '#8B5CF6' }}
                            onClick={() => setTab('appointments')}>
                            <div>
                                <div className="ad-stat-label">Appointments</div>
                                <div className="ad-stat-value" style={{ color: '#8B5CF6' }}>
                                    {appointments.length}
                                </div>
                            </div>
                            <div className="ad-stat-icon">📅</div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="ad-tabs">
                        {tabs.map(t => (
                            <button
                                key={t.key}
                                className={`ad-tab ${tab === t.key ? 'active' : ''}`}
                                onClick={() => setTab(t.key)}>
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Users Tab */}
                    {tab === 'users' && (
                        <div className="ad-table-wrapper">
                            <table className="ad-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id}>
                                            <td style={{ color: '#475569' }}>#{u.id}</td>
                                            <td style={{ fontWeight: 600, color: '#F1F5F9' }}>{u.name}</td>
                                            <td style={{ color: '#64748B' }}>{u.email}</td>
                                            <td>
                                                <span className="ad-badge" style={roleStyle(u.role)}>
                                                    {u.role}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Appointments Tab */}
                    {tab === 'appointments' && (
                        <div className="ad-table-wrapper">
                            <table className="ad-table">
                                <thead>
                                    <tr>
                                        <th>Patient</th>
                                        <th>Doctor</th>
                                        <th>Department</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', color: '#94A3B8', padding: '32px' }}>
                                                No appointments yet
                                            </td>
                                        </tr>
                                    ) : appointments.map(a => (
                                        <tr key={a.id}>
                                            <td style={{ fontWeight: 600, color: '#F1F5F9' }}>{a.patientName}</td>
                                            <td>Dr. {a.doctorName}</td>
                                            <td style={{ color: '#64748B' }}>{a.departmentName}</td>
                                            <td>{a.date}</td>
                                            <td style={{ color: '#64748B' }}>{a.startTime}</td>
                                            <td>
                                                <span className="ad-badge" style={statusStyle(a.status)}>
                                                    {a.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Departments Tab */}
                    {tab === 'departments' && (
                        <div>
                            <div className="ad-add-dept">
                                <h4>➕ Add New Department</h4>
                                <div className="ad-add-dept-form">
                                    <input
                                        className="ad-input"
                                        placeholder="Department name"
                                        value={newDept.name}
                                        onChange={e => setNewDept({ ...newDept, name: e.target.value })}
                                    />
                                    <input
                                        className="ad-input"
                                        placeholder="Description (optional)"
                                        value={newDept.description}
                                        onChange={e => setNewDept({ ...newDept, description: e.target.value })}
                                    />
                                    <button
                                        className="ad-add-btn"
                                        onClick={handleAddDept}
                                        disabled={loading}>
                                        {loading ? 'Adding...' : '+ Add'}
                                    </button>
                                </div>
                            </div>
                            <div className="ad-table-wrapper">
                                <table className="ad-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {departments.map(d => (
                                            <tr key={d.id}>
                                                <td style={{ color: '#475569' }}>#{d.id}</td>
                                                <td style={{ fontWeight: 600, color: '#F1F5F9' }}>{d.name}</td>
                                                <td style={{ color: '#64748B' }}>{d.description}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Doctors Tab */}
                    {tab === 'doctors' && (
                        <div>
                            <div className="ad-add-dept">
                                <h4>➕ Assign Doctor Profile</h4>
                                <div className="ad-add-doctor-form">
                                    <div>
                                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Doctor User</div>
                                        <select
                                            className="ad-select"
                                            value={newDoctor.userId}
                                            onChange={e => setNewDoctor({ ...newDoctor, userId: e.target.value })}>
                                            <option value="">Select doctor user...</option>
                                            {doctorUsers
                                                .filter(u => !doctors.find(d => d.email === u.email))
                                                .map(u => (
                                                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Department</div>
                                        <select
                                            className="ad-select"
                                            value={newDoctor.departmentId}
                                            onChange={e => setNewDoctor({ ...newDoctor, departmentId: e.target.value })}>
                                            <option value="">Select department...</option>
                                            {departments.map(d => (
                                                <option key={d.id} value={d.id}>{d.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <input
                                        className="ad-input"
                                        placeholder="Specialization"
                                        value={newDoctor.specialization}
                                        onChange={e => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                                    />
                                    <input
                                        className="ad-input"
                                        placeholder="Phone (optional)"
                                        value={newDoctor.phone}
                                        onChange={e => setNewDoctor({ ...newDoctor, phone: e.target.value })}
                                    />
                                    <button
                                        className="ad-add-btn"
                                        onClick={handleAddDoctor}
                                        disabled={loading}>
                                        {loading ? 'Adding...' : '+ Add'}
                                    </button>
                                </div>
                                {doctorUsers.filter(u => !doctors.find(d => d.email === u.email)).length === 0 && doctorUsers.length > 0 && (
                                    <div style={{ marginTop: '12px', fontSize: '13px', color: '#64748B' }}>
                                        All registered doctor users have been assigned a profile.
                                    </div>
                                )}
                                {doctorUsers.length === 0 && (
                                    <div style={{ marginTop: '12px', fontSize: '13px', color: '#64748B' }}>
                                        No users with DOCTOR role registered yet.
                                    </div>
                                )}
                            </div>
                            <div className="ad-table-wrapper">
                                <table className="ad-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Department</th>
                                            <th>Specialization</th>
                                            <th>Phone</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {doctors.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" style={{ textAlign: 'center', color: '#94A3B8', padding: '32px' }}>
                                                    No doctor profiles created yet
                                                </td>
                                            </tr>
                                        ) : doctors.map(d => (
                                            <tr key={d.id}>
                                                <td style={{ fontWeight: 600 }}>Dr. {d.name}</td>
                                                <td style={{ color: '#64748B' }}>{d.email}</td>
                                                <td>{d.departmentName}</td>
                                                <td style={{ color: '#64748B' }}>{d.specialization}</td>
                                                <td>{d.phone}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default AdminDashboard;