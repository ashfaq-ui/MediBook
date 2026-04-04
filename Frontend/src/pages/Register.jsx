import { useState } from 'react';
import api from '../api/axios';

function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'PATIENT' });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', form);
            alert('Registration successful! Please login.');
            window.location.href = '/login';
        } catch (err) {
            setError('Registration failed. Email may already exist.');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px' }}>
            <h2>MediBook Register</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleRegister}>
                <div style={{ marginBottom: '12px' }}>
                    <input name="name" type="text" placeholder="Full Name" value={form.name} onChange={handleChange} style={{ width: '100%', padding: '8px' }} required />
                </div>
                <div style={{ marginBottom: '12px' }}>
                    <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} style={{ width: '100%', padding: '8px' }} required />
                </div>
                <div style={{ marginBottom: '12px' }}>
                    <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} style={{ width: '100%', padding: '8px' }} required />
                </div>
                <div style={{ marginBottom: '12px' }}>
                    <select name="role" value={form.role} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
                        <option value="PATIENT">Patient</option>
                        <option value="DOCTOR">Doctor</option>
                    </select>
                </div>
                <button type="submit" style={{ width: '100%', padding: '10px', background: '#0D9488', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Register
                </button>
            </form>
            <p>Already have an account? <a href="/login">Login</a></p>
        </div>
    );
}

export default Register;