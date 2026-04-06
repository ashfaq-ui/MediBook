import { useState, useEffect } from 'react';
import api from '../../api/axios';

function AdminDashboard() {
    const name = localStorage.getItem('name');
    const [tab, setTab] = useState('overview');
    const [users, setUsers] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [newDept, setNewDept] = useState({ name: '', description: '' });

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

    const handleAddDept = async () => {
        if (!newDept.name) return alert('Department name is required');
        try {
            await api.post('/departments', newDept);
            setNewDept({ name: '', description: '' });
            fetchAll();
            alert('Department added!');
        } catch (err) {
            alert('Failed to add department');
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    const patients = users.filter(u => u.role === 'PATIENT');
    const doctorUsers = users.filter(u => u.role === 'DOCTOR');

    const tabStyle = (t) => ({
        padding: '10px 20px',
        cursor: 'pointer',
        border: 'none',
        borderBottom: tab === t ? '3px solid #0D9488' : '3px solid transparent',
        background: 'none',
        fontWeight: tab === t ? 'bold' : 'normal',
        color: tab === t ? '#0D9488' : '#64748B',
        fontSize: '14px'
    });

    return (
        <div style={{ fontFamily: 'sans-serif', background: '#F8FAFC', minHeight: '100vh' }}>
            {/* Navbar */}
            <div style={{
                background: '#0F172A', padding: '16px 32px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <h2 style={{ color: 'white', margin: 0 }}>🏥 MediBook Admin</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ color: 'white' }}>🛡️ {name}</span>
                    <button onClick={handleLogout} style={{
                        background: 'white', color: '#0F172A', border: 'none',
                        padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
                    }}>Logout</button>
                </div>
            </div>

            <div style={{ padding: '32px' }}>
                <h3>Admin Dashboard</h3>

                {/* Stats Cards */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                    <div style={{
                        background: '#EFF6FF', border: '1px solid #93C5FD',
                        borderRadius: '8px', padding: '20px', flex: 1
                    }}>
                        <p style={{ margin: 0, color: '#2563EB', fontWeight: 'bold' }}>Total Patients</p>
                        <h2 style={{ margin: '8px 0', color: '#1D4ED8' }}>{patients.length}</h2>
                    </div>
                    <div style={{
                        background: '#F0FDF4', border: '1px solid #86EFAC',
                        borderRadius: '8px', padding: '20px', flex: 1
                    }}>
                        <p style={{ margin: 0, color: '#16A34A', fontWeight: 'bold' }}>Total Doctors</p>
                        <h2 style={{ margin: '8px 0', color: '#15803D' }}>{doctorUsers.length}</h2>
                    </div>
                    <div style={{
                        background: '#FFF7ED', border: '1px solid #FCD34D',
                        borderRadius: '8px', padding: '20px', flex: 1
                    }}>
                        <p style={{ margin: 0, color: '#D97706', fontWeight: 'bold' }}>Departments</p>
                        <h2 style={{ margin: '8px 0', color: '#B45309' }}>{departments.length}</h2>
                    </div>
                    <div style={{
                        background: '#FDF4FF', border: '1px solid #E9D5FF',
                        borderRadius: '8px', padding: '20px', flex: 1
                    }}>
                        <p style={{ margin: 0, color: '#7C3AED', fontWeight: 'bold' }}>Total Appointments</p>
                        <h2 style={{ margin: '8px 0', color: '#6D28D9' }}>{appointments.length}</h2>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ borderBottom: '1px solid #E2E8F0', marginBottom: '24px' }}>
                    <button style={tabStyle('overview')} onClick={() => setTab('overview')}>👥 Users</button>
                    <button style={tabStyle('appointments')} onClick={() => setTab('appointments')}>📅 Appointments</button>
                    <button style={tabStyle('departments')} onClick={() => setTab('departments')}>🏥 Departments</button>
                    <button style={tabStyle('doctors')} onClick={() => setTab('doctors')}>👨‍⚕️ Doctors</button>
                </div>

                {/* Users Tab */}
                {tab === 'overview' && (
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px' }}>
                        <thead>
                            <tr style={{ background: '#F1F5F9' }}>
                                <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} style={{ borderTop: '1px solid #E2E8F0' }}>
                                    <td style={{ padding: '12px' }}>{u.id}</td>
                                    <td style={{ padding: '12px' }}>{u.name}</td>
                                    <td style={{ padding: '12px' }}>{u.email}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                                            background: u.role === 'PATIENT' ? '#DCFCE7' : u.role === 'DOCTOR' ? '#DBEAFE' : '#FEE2E2',
                                            color: u.role === 'PATIENT' ? '#166534' : u.role === 'DOCTOR' ? '#1E40AF' : '#991B1B'
                                        }}>
                                            {u.role}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Appointments Tab */}
                {tab === 'appointments' && (
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px' }}>
                        <thead>
                            <tr style={{ background: '#F1F5F9' }}>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Patient</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Doctor</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Department</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map(a => (
                                <tr key={a.id} style={{ borderTop: '1px solid #E2E8F0' }}>
                                    <td style={{ padding: '12px' }}>{a.patientName}</td>
                                    <td style={{ padding: '12px' }}>Dr. {a.doctorName}</td>
                                    <td style={{ padding: '12px' }}>{a.departmentName}</td>
                                    <td style={{ padding: '12px' }}>{a.date}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                                            background: a.status === 'PENDING' ? '#FEF9C3' : a.status === 'CONFIRMED' ? '#DCFCE7' : a.status === 'CANCELLED' ? '#FEE2E2' : '#DBEAFE',
                                            color: a.status === 'PENDING' ? '#854D0E' : a.status === 'CONFIRMED' ? '#166534' : a.status === 'CANCELLED' ? '#991B1B' : '#1E40AF'
                                        }}>
                                            {a.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Departments Tab */}
                {tab === 'departments' && (
                    <div>
                        {/* Add Department Form */}
                        <div style={{
                            background: 'white', borderRadius: '8px',
                            border: '1px solid #E2E8F0', padding: '20px', marginBottom: '20px'
                        }}>
                            <h4 style={{ marginTop: 0 }}>Add New Department</h4>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <input
                                    placeholder="Department name"
                                    value={newDept.name}
                                    onChange={e => setNewDept({ ...newDept, name: e.target.value })}
                                    style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                                />
                                <input
                                    placeholder="Description"
                                    value={newDept.description}
                                    onChange={e => setNewDept({ ...newDept, description: e.target.value })}
                                    style={{ flex: 2, padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                                />
                                <button onClick={handleAddDept} style={{
                                    background: '#0D9488', color: 'white', border: 'none',
                                    padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
                                }}>Add</button>
                            </div>
                        </div>

                        {/* Departments List */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px' }}>
                            <thead>
                                <tr style={{ background: '#F1F5F9' }}>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {departments.map(d => (
                                    <tr key={d.id} style={{ borderTop: '1px solid #E2E8F0' }}>
                                        <td style={{ padding: '12px' }}>{d.id}</td>
                                        <td style={{ padding: '12px' }}>{d.name}</td>
                                        <td style={{ padding: '12px' }}>{d.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Doctors Tab */}
                {tab === 'doctors' && (
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px' }}>
                        <thead>
                            <tr style={{ background: '#F1F5F9' }}>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Department</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Specialization</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Phone</th>
                            </tr>
                        </thead>
                        <tbody>
                            {doctors.map(d => (
                                <tr key={d.id} style={{ borderTop: '1px solid #E2E8F0' }}>
                                    <td style={{ padding: '12px' }}>Dr. {d.name}</td>
                                    <td style={{ padding: '12px' }}>{d.email}</td>
                                    <td style={{ padding: '12px' }}>{d.departmentName}</td>
                                    <td style={{ padding: '12px' }}>{d.specialization}</td>
                                    <td style={{ padding: '12px' }}>{d.phone}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;