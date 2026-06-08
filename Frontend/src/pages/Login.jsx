import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@asgardeo/auth-react';
import api from '../api/axios';

function Login() {
    const { state, signIn, getAccessToken } = useAuthContext();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (state.isAuthenticated) {
            setLoading(true);
            const syncUser = async () => {
                try {
                    const token = await getAccessToken();
                    localStorage.setItem('token', token);

                    const res = await api.get('/auth/me');
                    localStorage.setItem('role', res.data.role);
                    localStorage.setItem('name', res.data.name);
                    localStorage.setItem('userId', res.data.id);
                    localStorage.setItem('email', res.data.email);

                    const role = res.data.role;
                    if (role === 'PATIENT') navigate('/patient/dashboard');
                    else if (role === 'DOCTOR') navigate('/doctor/dashboard');
                    else if (role === 'ADMIN') navigate('/admin/dashboard');
                } catch (err) {
                    console.error('Failed to sync user with backend', err);
                    setError('Authentication succeeded, but failed to sync user with clinical backend.');
                } finally {
                    setLoading(false);
                }
            };
            syncUser();
        }
    }, [state.isAuthenticated, getAccessToken, navigate]);

    const handleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            await signIn();
        } catch (err) {
            console.error('Asgardeo sign in error', err);
            setError('Failed to initiate login with Asgardeo.');
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

                .bottom-text {
                    text-align: center;
                    font-size: 14px;
                    color: #64748B;
                    margin-top: 24px;
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

                    <button 
                        className="submit-btn" 
                        onClick={handleLogin} 
                        disabled={loading || state.isLoading}
                    >
                        {loading || state.isLoading ? 'Signing in...' : 'Sign In with Asgardeo'}
                    </button>

                    <p className="bottom-text">
                        Protected by WSO2 Asgardeo Identity Platform
                    </p>
                </div>
            </div>
        </>
    );
}

export default Login;