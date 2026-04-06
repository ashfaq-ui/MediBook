import { useState } from 'react';
import api from '../api/axios';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.role);
            localStorage.setItem('name', response.data.name);
            localStorage.setItem('userId', response.data.userId);
            localStorage.setItem('email', response.data.email);
            const role = response.data.role;
            if (role === 'PATIENT') {
                window.location.href = '/patient/dashboard';
            } else if (role === 'DOCTOR') {
                window.location.href = '/doctor/dashboard';
            } else if (role === 'ADMIN') {
                window.location.href = '/admin/dashboard';
            }

        } catch (err) {
            setError('Invalid email or password');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px' }}>
            <h2>MediBook Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '12px' }}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ width: '100%', padding: '8px' }}
                        required
                    />
                </div>
                <div style={{ marginBottom: '12px' }}>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: '100%', padding: '8px' }}
                        required
                    />
                </div>
                <button type="submit" style={{ width: '100%', padding: '10px', background: '#0D9488', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Login
                </button>
            </form>
            <p>Don't have an account? <a href="/register">Register</a></p>
        </div>
    );
}

export default Login;