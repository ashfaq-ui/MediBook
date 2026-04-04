import { useState } from 'react';

function DoctorDashboard() {
    const name = localStorage.getItem('name');

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    return (
        <div style={{ fontFamily: 'sans-serif' }}>
            {/* Navbar */}
            <div style={{
                background: '#1D4ED8',
                padding: '16px 32px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h2 style={{ color: 'white', margin: 0 }}>🏥 MediBook</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ color: 'white' }}>👨‍⚕️ Dr. {name}</span>
                    <button
                        onClick={handleLogout}
                        style={{
                            background: 'white',
                            color: '#1D4ED8',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}>
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ padding: '32px' }}>
                <h3>Welcome, Dr. {name}! 👋</h3>

                {/* Stats Cards */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                    <div style={{
                        background: '#EFF6FF', border: '1px solid #93C5FD',
                        borderRadius: '8px', padding: '20px', flex: 1
                    }}>
                        <p style={{ margin: 0, color: '#2563EB', fontWeight: 'bold' }}>Today's</p>
                        <h2 style={{ margin: '8px 0', color: '#1D4ED8' }}>0</h2>
                        <p style={{ margin: 0, color: '#64748B' }}>Appointments</p>
                    </div>
                    <div style={{
                        background: '#F0FDF4', border: '1px solid #86EFAC',
                        borderRadius: '8px', padding: '20px', flex: 1
                    }}>
                        <p style={{ margin: 0, color: '#16A34A', fontWeight: 'bold' }}>Completed</p>
                        <h2 style={{ margin: '8px 0', color: '#15803D' }}>0</h2>
                        <p style={{ margin: 0, color: '#64748B' }}>Today</p>
                    </div>
                    <div style={{
                        background: '#FFF7ED', border: '1px solid #FCD34D',
                        borderRadius: '8px', padding: '20px', flex: 1
                    }}>
                        <p style={{ margin: 0, color: '#D97706', fontWeight: 'bold' }}>Pending</p>
                        <h2 style={{ margin: '8px 0', color: '#B45309' }}>0</h2>
                        <p style={{ margin: 0, color: '#64748B' }}>Appointments</p>
                    </div>
                </div>

                {/* Today's Schedule */}
                <h4>Today's Schedule</h4>
                <div style={{
                    background: 'white',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    padding: '20px',
                    textAlign: 'center',
                    color: '#64748B'
                }}>
                    No appointments scheduled for today.
                </div>
            </div>
        </div>
    );
}

export default DoctorDashboard;