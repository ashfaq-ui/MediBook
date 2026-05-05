import { useState } from 'react';
import api from '../api/axios';

function AppointmentSummary({ appointmentId }) {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const generateSummary = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.post(`/ai/summary/${appointmentId}`);
            setSummary(res.data.summary);
        } catch {
            setError('Failed to generate summary. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                .as-container { margin-top: 16px; }

                .as-generate-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: linear-gradient(135deg, #6366F1, #8B5CF6);
                    color: #fff;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 600;
                    transition: opacity 0.2s, transform 0.1s;
                    box-shadow: 0 4px 12px rgba(99,102,241,0.3);
                }

                .as-generate-btn:hover:not(:disabled) {
                    opacity: 0.85;
                    transform: translateY(-1px);
                }

                .as-generate-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }

                .as-spinner {
                    width: 14px;
                    height: 14px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: as-spin 0.7s linear infinite;
                }

                @keyframes as-spin { to { transform: rotate(360deg); } }

                .as-card {
                    background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08));
                    border: 1px solid rgba(99,102,241,0.25);
                    border-radius: 12px;
                    padding: 20px;
                    margin-top: 0;
                }

                .as-card-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 14px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid rgba(99,102,241,0.2);
                }

                .as-card-icon {
                    width: 32px;
                    height: 32px;
                    background: linear-gradient(135deg, #6366F1, #8B5CF6);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    flex-shrink: 0;
                }

                .as-card-title {
                    font-size: 13px;
                    font-weight: 700;
                    color: #A5B4FC;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .as-card-subtitle {
                    font-size: 11px;
                    color: #64748B;
                    margin-top: 2px;
                }

                .as-card-body {
                    font-size: 14px;
                    color: #CBD5E1;
                    line-height: 1.7;
                    white-space: pre-wrap;
                }

                .as-error {
                    font-size: 13px;
                    color: #FCA5A5;
                    background: rgba(239,68,68,0.1);
                    border: 1px solid rgba(239,68,68,0.2);
                    border-radius: 8px;
                    padding: 10px 14px;
                    margin-top: 12px;
                }

                .as-regenerate-btn {
                    margin-top: 14px;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: transparent;
                    border: 1px solid rgba(99,102,241,0.35);
                    color: #A5B4FC;
                    padding: 7px 14px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 600;
                    transition: background 0.2s;
                }

                .as-regenerate-btn:hover { background: rgba(99,102,241,0.12); }
            `}</style>

            <div className="as-container">
                {!summary ? (
                    <>
                        <button
                            className="as-generate-btn"
                            onClick={generateSummary}
                            disabled={loading}>
                            {loading ? (
                                <>
                                    <div className="as-spinner" />
                                    Generating Summary...
                                </>
                            ) : (
                                <>✨ Generate AI Summary</>
                            )}
                        </button>
                        {error && <div className="as-error">{error}</div>}
                    </>
                ) : (
                    <div className="as-card">
                        <div className="as-card-header">
                            <div className="as-card-icon">✨</div>
                            <div>
                                <div className="as-card-title">AI Appointment Summary</div>
                                <div className="as-card-subtitle">Generated by MediBook AI</div>
                            </div>
                        </div>
                        <div className="as-card-body">{summary}</div>
                        <button
                            className="as-regenerate-btn"
                            onClick={generateSummary}
                            disabled={loading}>
                            {loading ? <><div className="as-spinner" style={{borderColor:'rgba(165,180,252,0.3)', borderTopColor:'#A5B4FC'}} /> Regenerating...</> : '↺ Regenerate'}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}

export default AppointmentSummary;
