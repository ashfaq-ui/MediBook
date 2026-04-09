import { useState } from 'react';
import api from '../api/axios';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.role);
            localStorage.setItem('name', response.data.name);
            localStorage.setItem('userId', response.data.userId);
            localStorage.setItem('email', response.data.email);

            const role = response.data.role;
            if (role === 'PATIENT') window.location.href = '/patient/dashboard';
            else if (role === 'DOCTOR') window.location.href = '/doctor/dashboard';
            else if (role === 'ADMIN') window.location.href = '/admin/dashboard';
        } catch (err) {
            setError('Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                * { box-sizing: border-box; margin: 0; padding: 0; }

                .login-wrapper {
                    min-height: 100vh;
                    background: #0F172A;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }

                .login-card {
                    background: #1E293B;
                    border: 1px solid #334155;
                    border-radius: 16px;
                    padding: 48px 40px;
                    width: 100%;
                    max-width: 420px;
                    box-shadow: 0 25px 50px rgba(0,0,0,0.5);
                }

                .login-logo {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .login-logo h1 {
                    font-size: 28px;
                    font-weight: bold;
                    color: #F1F5F9;
                    margin: 8px 0 0;
                }

                .login-logo p {
                    color: #64748B;
                    font-size: 14px;
                    margin-top: 4px;
                }

                .login-title {
                    font-size: 20px;
                    color: #F1F5F9;
                    text-align: center;
                    margin-bottom: 24px;
                }

                .error-box {
                    background: rgba(239,68,68,0.15);
                    border: 1px solid rgba(239,68,68,0.3);
                    border-radius: 8px;
                    padding: 12px 16px;
                    margin-bottom: 20px;
                    color: #FCA5A5;
                    font-size: 14px;
                }

                .form-group {
                    margin-bottom: 16px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 6px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #CBD5E1;
                }

                .form-input {
                    width: 100%;
                    padding: 12px 16px;
                    border-radius: 8px;
                    border: 1.5px solid #334155;
                    background: #0F172A;
                    color: #F1F5F9;
                    font-size: 14px;
                    outline: none;
                    transition: border-color 0.2s;
                }

                .form-input::placeholder { color: #475569; }

                .form-input:focus {
                    border-color: #0D9488;
                }

                .submit-btn {
                    width: 100%;
                    padding: 13px;
                    background: #0D9488;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s;
                    margin-top: 8px;
                }

                .submit-btn:hover { background: #0F766E; }
                .submit-btn:disabled { background: #334155; color: #64748B; cursor: not-allowed; }

                .divider {
                    display: flex;
                    align-items: center;
                    margin: 24px 0;
                    gap: 12px;
                }

                .divider-line {
                    flex: 1;
                    height: 1px;
                    background: #334155;
                }

                .divider span {
                    color: #475569;
                    font-size: 13px;
                }

                .bottom-text {
                    text-align: center;
                    font-size: 14px;
                    color: #64748B;
                }

                .bottom-text a {
                    color: #2DD4BF;
                    font-weight: 600;
                    text-decoration: none;
                }

                @media (max-width: 480px) {
                    .login-card {
                        padding: 32px 24px;
                        border-radius: 12px;
                    }
                    .login-logo h1 { font-size: 24px; }
                    .login-title { font-size: 18px; }
                }
            `}</style>

            <div className="login-wrapper">
                <div className="login-card">
                    <div className="login-logo">
                        <div style={{ fontSize: '40px' }}>🏥</div>
                        <h1>MediBook</h1>
                        <p>Your health, our priority</p>
                    </div>

                    <h2 className="login-title">Welcome back</h2>

                    {error && <div className="error-box">⚠️ {error}</div>}

                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                className="form-input"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '24px' }}>
                            <label>Password</label>
                            <input
                                className="form-input"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button className="submit-btn" type="submit" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="divider">
                        <div className="divider-line" />
                        <span>or</span>
                        <div className="divider-line" />
                    </div>

                    <p className="bottom-text">
                        Don't have an account?{' '}
                        <a href="/register">Create one</a>
                    </p>
                </div>
            </div>
        </>
    );
}

export default Login;