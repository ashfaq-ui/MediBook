import { useState } from 'react';
import api from '../api/axios';

function Register() {
    const [form, setForm] = useState({
        name: '', email: '', password: '', role: 'PATIENT'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/register', form);
            window.location.href = '/login';
        } catch (err) {
            setError('Registration failed. Email may already be in use.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                * { box-sizing: border-box; margin: 0; padding: 0; }

                .register-wrapper {
                    min-height: 100vh;
                    background: #0F172A;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }

                .register-card {
                    background: #1E293B;
                    border: 1px solid #334155;
                    border-radius: 16px;
                    padding: 48px 40px;
                    width: 100%;
                    max-width: 420px;
                    box-shadow: 0 25px 50px rgba(0,0,0,0.5);
                }

                .register-logo {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .register-logo h1 {
                    font-size: 28px;
                    font-weight: bold;
                    color: #F1F5F9;
                    margin: 8px 0 0;
                }

                .register-logo p {
                    color: #64748B;
                    font-size: 14px;
                    margin-top: 4px;
                }

                .register-title {
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
                .form-input:focus { border-color: #0D9488; }

                .role-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-bottom: 24px;
                }

                .role-card {
                    padding: 14px 12px;
                    border-radius: 10px;
                    cursor: pointer;
                    border: 2px solid #334155;
                    background: #0F172A;
                    text-align: center;
                    transition: all 0.2s;
                }

                .role-card:hover { border-color: #0D9488; }

                .role-card.active {
                    border-color: #0D9488;
                    background: rgba(13,148,136,0.1);
                }

                .role-icon { font-size: 26px; margin-bottom: 6px; }

                .role-name {
                    font-weight: 600;
                    font-size: 13px;
                    color: #CBD5E1;
                }

                .role-card.active .role-name { color: #2DD4BF; }

                .role-desc {
                    font-size: 11px;
                    color: #475569;
                    margin-top: 3px;
                    line-height: 1.4;
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
                }

                .submit-btn:hover { background: #0F766E; }
                .submit-btn:disabled { background: #334155; color: #64748B; cursor: not-allowed; }

                .divider {
                    display: flex;
                    align-items: center;
                    margin: 24px 0;
                    gap: 12px;
                }

                .divider-line { flex: 1; height: 1px; background: #334155; }
                .divider span { color: #475569; font-size: 13px; }

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
                    .register-card {
                        padding: 32px 20px;
                        border-radius: 12px;
                    }
                    .register-logo h1 { font-size: 22px; }
                    .register-title { font-size: 17px; }
                    .role-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
                    .role-card { padding: 10px 8px; }
                    .role-icon { font-size: 22px; }
                }
            `}</style>

            <div className="register-wrapper">
                <div className="register-card">
                    <div className="register-logo">
                        <div style={{ fontSize: '40px' }}>🏥</div>
                        <h1>MediBook</h1>
                        <p>Your health, our priority</p>
                    </div>

                    <h2 className="register-title">Create your account</h2>

                    {error && <div className="error-box">⚠️ {error}</div>}

                    <form onSubmit={handleRegister}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                className="form-input"
                                name="name"
                                type="text"
                                placeholder="Mohamed Ashfaq"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                className="form-input"
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input
                                className="form-input"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>I am a</label>
                            <div className="role-grid">
                                {[
                                    { role: 'PATIENT', icon: '🧑‍⚕️', desc: 'Book and manage appointments' },
                                    { role: 'DOCTOR', icon: '👨‍⚕️', desc: 'Manage schedule and patients' },
                                ].map(({ role, icon, desc }) => (
                                    <div
                                        key={role}
                                        className={`role-card ${form.role === role ? 'active' : ''}`}
                                        onClick={() => setForm({ ...form, role })}
                                    >
                                        <div className="role-icon">{icon}</div>
                                        <div className="role-name">{role}</div>
                                        <div className="role-desc">{desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button className="submit-btn" type="submit" disabled={loading}>
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="divider">
                        <div className="divider-line" />
                        <span>or</span>
                        <div className="divider-line" />
                    </div>

                    <p className="bottom-text">
                        Already have an account?{' '}
                        <a href="/login">Sign in</a>
                    </p>
                </div>
            </div>
        </>
    );
}

export default Register;