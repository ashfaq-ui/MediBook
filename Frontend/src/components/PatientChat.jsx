import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

function PatientChat() {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I\'m your MediBook AI assistant. I can help answer general health questions, explain medical terms, or help you understand your appointments. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || loading) return;

        const userMessage = { role: 'user', content: text };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');
        setLoading(true);

        try {
            const res = await api.post('/ai/chat', {
                messages: updatedMessages.map(m => ({ role: m.role, content: m.content }))
            });
            setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
        } catch {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            <style>{`
                .pc-container {
                    background: #1E293B;
                    border: 1px solid #334155;
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    height: 520px;
                    overflow: hidden;
                }

                .pc-header {
                    padding: 16px 20px;
                    background: #162032;
                    border-bottom: 1px solid #334155;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .pc-header-icon {
                    width: 36px;
                    height: 36px;
                    background: linear-gradient(135deg, #0D9488, #0891B2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                }

                .pc-header-text h4 {
                    font-size: 14px;
                    font-weight: 700;
                    color: #F1F5F9;
                }

                .pc-header-text p {
                    font-size: 12px;
                    color: #22C55E;
                }

                .pc-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    scrollbar-width: thin;
                    scrollbar-color: #334155 transparent;
                }

                .pc-messages::-webkit-scrollbar { width: 4px; }
                .pc-messages::-webkit-scrollbar-track { background: transparent; }
                .pc-messages::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }

                .pc-bubble-row {
                    display: flex;
                    align-items: flex-end;
                    gap: 8px;
                }

                .pc-bubble-row.user {
                    flex-direction: row-reverse;
                }

                .pc-avatar {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    flex-shrink: 0;
                }

                .pc-avatar.ai { background: linear-gradient(135deg, #0D9488, #0891B2); }
                .pc-avatar.user { background: linear-gradient(135deg, #6366F1, #8B5CF6); }

                .pc-bubble {
                    max-width: 72%;
                    padding: 10px 14px;
                    border-radius: 16px;
                    font-size: 14px;
                    line-height: 1.5;
                    word-break: break-word;
                    white-space: pre-wrap;
                }

                .pc-bubble.ai {
                    background: #263347;
                    color: #CBD5E1;
                    border-bottom-left-radius: 4px;
                }

                .pc-bubble.user {
                    background: linear-gradient(135deg, #0D9488, #0891B2);
                    color: #fff;
                    border-bottom-right-radius: 4px;
                }

                .pc-typing {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 10px 14px;
                    background: #263347;
                    border-radius: 16px;
                    border-bottom-left-radius: 4px;
                    width: fit-content;
                }

                .pc-dot {
                    width: 7px;
                    height: 7px;
                    background: #64748B;
                    border-radius: 50%;
                    animation: pc-bounce 1.2s infinite;
                }

                .pc-dot:nth-child(2) { animation-delay: 0.2s; }
                .pc-dot:nth-child(3) { animation-delay: 0.4s; }

                @keyframes pc-bounce {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-6px); }
                }

                .pc-input-area {
                    padding: 14px 16px;
                    background: #162032;
                    border-top: 1px solid #334155;
                    display: flex;
                    gap: 10px;
                    align-items: flex-end;
                }

                .pc-textarea {
                    flex: 1;
                    background: #1E293B;
                    border: 1px solid #334155;
                    border-radius: 10px;
                    padding: 10px 14px;
                    color: #F1F5F9;
                    font-size: 14px;
                    resize: none;
                    outline: none;
                    font-family: inherit;
                    line-height: 1.4;
                    max-height: 100px;
                    transition: border-color 0.2s;
                }

                .pc-textarea:focus { border-color: #0D9488; }
                .pc-textarea::placeholder { color: #475569; }

                .pc-send-btn {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #0D9488, #0891B2);
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    transition: opacity 0.2s, transform 0.1s;
                    flex-shrink: 0;
                }

                .pc-send-btn:hover:not(:disabled) { opacity: 0.85; transform: scale(1.05); }
                .pc-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
            `}</style>

            <div className="pc-container">
                <div className="pc-header">
                    <div className="pc-header-icon">🤖</div>
                    <div className="pc-header-text">
                        <h4>MediBook AI Assistant</h4>
                        <p>● Online</p>
                    </div>
                </div>

                <div className="pc-messages">
                    {messages.map((msg, i) => (
                        <div key={i} className={`pc-bubble-row ${msg.role === 'user' ? 'user' : 'ai'}`}>
                            <div className={`pc-avatar ${msg.role === 'user' ? 'user' : 'ai'}`}>
                                {msg.role === 'user' ? '👤' : '🤖'}
                            </div>
                            <div className={`pc-bubble ${msg.role === 'user' ? 'user' : 'ai'}`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="pc-bubble-row ai">
                            <div className="pc-avatar ai">🤖</div>
                            <div className="pc-typing">
                                <div className="pc-dot" />
                                <div className="pc-dot" />
                                <div className="pc-dot" />
                            </div>
                        </div>
                    )}

                    <div ref={bottomRef} />
                </div>

                <div className="pc-input-area">
                    <textarea
                        className="pc-textarea"
                        rows={1}
                        placeholder="Ask me anything about your health..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                    />
                    <button
                        className="pc-send-btn"
                        onClick={sendMessage}
                        disabled={!input.trim() || loading}
                        title="Send">
                        ➤
                    </button>
                </div>
            </div>
        </>
    );
}

export default PatientChat;
