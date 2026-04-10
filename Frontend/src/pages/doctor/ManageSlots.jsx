import { useState, useEffect } from 'react';
import api from '../../api/axios';

function ManageSlots({ doctorId }) {
    const [slots, setSlots] = useState([]);
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (date && doctorId) fetchSlots();
    }, [date, doctorId]);

    const fetchSlots = async () => {
        try {
            const res = await api.get(`/slots/available?doctorId=${doctorId}&date=${date}`);
            setSlots(res.data);
        } catch (err) {
            console.error('Failed to fetch slots', err);
        }
    };

    const handleAddSlot = async () => {
        if (!doctorId) return alert('Your doctor profile is not set up yet. Ask an Admin to add you.');
        if (!date || !startTime || !endTime) return alert('Please fill all fields');
        if (startTime >= endTime) return alert('End time must be after start time');
        setLoading(true);
        try {
            await api.post('/slots', {
                doctorId: parseInt(doctorId),
                date,
                startTime,
                endTime
            });
            fetchSlots();
            setStartTime('');
            setEndTime('');
        } catch (err) {
            alert('Failed to add slot');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                .ms-wrapper {
                    background: #1E293B;
                    border-radius: 12px;
                    border: 1px solid #334155;
                    padding: 28px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                }

                .ms-title {
                    font-size: 17px;
                    font-weight: 700;
                    color: #F1F5F9;
                    margin-bottom: 24px;
                }

                .ms-form {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr auto;
                    gap: 12px;
                    align-items: flex-end;
                    margin-bottom: 28px;
                    padding: 20px;
                    background: #162032;
                    border-radius: 10px;
                    border: 1px solid #334155;
                }

                .ms-field label {
                    display: block;
                    font-size: 12px;
                    font-weight: 600;
                    color: #64748B;
                    margin-bottom: 6px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .ms-input {
                    width: 100%;
                    padding: 10px 12px;
                    border-radius: 8px;
                    border: 1.5px solid #334155;
                    font-size: 13px;
                    outline: none;
                    background: #0F172A;
                    color: #F1F5F9;
                    transition: border-color 0.2s;
                    color-scheme: dark;
                }

                .ms-input:focus { border-color: #3B82F6; }

                .ms-add-btn {
                    background: #1D4ED8;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 600;
                    white-space: nowrap;
                    transition: background 0.2s;
                    box-shadow: 0 4px 12px rgba(29,78,216,0.25);
                }

                .ms-add-btn:hover { background: #1E40AF; }
                .ms-add-btn:disabled { background: #334155; color: #64748B; cursor: not-allowed; box-shadow: none; }

                .ms-slots-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #CBD5E1;
                    margin-bottom: 12px;
                }

                .ms-slots-grid {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                }

                .ms-slot {
                    padding: 10px 18px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .ms-slot.free {
                    background: rgba(34,197,94,0.1);
                    color: #86EFAC;
                    border: 1px solid rgba(34,197,94,0.25);
                }

                .ms-slot.booked {
                    background: rgba(239,68,68,0.1);
                    color: #FCA5A5;
                    border: 1px solid rgba(239,68,68,0.25);
                }

                .ms-no-slots {
                    text-align: center;
                    padding: 32px;
                    color: #475569;
                    font-size: 14px;
                }

                @media (max-width: 768px) {
                    .ms-form {
                        grid-template-columns: 1fr;
                    }
                    .ms-wrapper { padding: 16px; }
                }
            `}</style>

            <div className="ms-wrapper">
                <div className="ms-title">🗓 Manage Availability</div>
                {!doctorId && (
                    <div style={{ color: '#FCA5A5', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '14px' }}>
                        ⚠️ Your doctor profile has not been set up by an Admin yet. Please ask an Admin to add you to the doctors list.
                    </div>
                )}

                {/* Add Slot Form */}
                <div className="ms-form">
                    <div className="ms-field">
                        <label>Date</label>
                        <input
                            className="ms-input"
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                    <div className="ms-field">
                        <label>Start Time</label>
                        <input
                            className="ms-input"
                            type="time"
                            value={startTime}
                            onChange={e => setStartTime(e.target.value)}
                        />
                    </div>
                    <div className="ms-field">
                        <label>End Time</label>
                        <input
                            className="ms-input"
                            type="time"
                            value={endTime}
                            onChange={e => setEndTime(e.target.value)}
                        />
                    </div>
                    <button
                        className="ms-add-btn"
                        onClick={handleAddSlot}
                        disabled={loading}>
                        {loading ? 'Adding...' : '+ Add Slot'}
                    </button>
                </div>

                {/* Slots List */}
                {date && (
                    <>
                        <div className="ms-slots-title">
                            Slots for {date}
                        </div>
                        {slots.length === 0 ? (
                            <div className="ms-no-slots">
                                No slots added for this date yet.
                            </div>
                        ) : (
                            <div className="ms-slots-grid">
                                {slots.map(s => (
                                    <div
                                        key={s.id}
                                        className={`ms-slot ${s.booked ? 'booked' : 'free'}`}>
                                        🕐 {s.startTime} - {s.endTime}
                                        <span style={{ fontSize: '11px' }}>
                                            {s.booked ? '🔴 Booked' : '🟢 Free'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

export default ManageSlots;