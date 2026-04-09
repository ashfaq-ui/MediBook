import { useState, useEffect } from 'react';
import api from '../../api/axios';

function BookAppointment({ patientId, onBooked }) {
    const [departments, setDepartments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [slots, setSlots] = useState([]);
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSlot, setSelectedSlot] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get('/departments').then(res => setDepartments(res.data));
    }, []);

    useEffect(() => {
        if (selectedDept) {
            api.get(`/doctors/department/${selectedDept}`)
                .then(res => setDoctors(res.data));
            setSelectedDoctor('');
            setSlots([]);
            setSelectedSlot('');
        }
    }, [selectedDept]);

    useEffect(() => {
        if (selectedDoctor && selectedDate) {
            api.get(`/slots/available?doctorId=${selectedDoctor}&date=${selectedDate}`)
                .then(res => setSlots(res.data));
            setSelectedSlot('');
        }
    }, [selectedDoctor, selectedDate]);

    const handleBook = async () => {
        if (!selectedSlot) return alert('Please select a time slot');
        setLoading(true);
        try {
            await api.post('/appointments', {
                patientId: parseInt(patientId),
                doctorId: parseInt(selectedDoctor),
                slotId: parseInt(selectedSlot)
            });
            alert('Appointment booked! Check your email for confirmation.');
            onBooked();
        } catch (err) {
            alert('Booking failed. Slot may already be taken.');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { num: 1, label: 'Department', done: !!selectedDept },
        { num: 2, label: 'Doctor', done: !!selectedDoctor },
        { num: 3, label: 'Date', done: !!selectedDate },
        { num: 4, label: 'Time Slot', done: !!selectedSlot },
    ];

    return (
        <>
            <style>{`
                .ba-wrapper {
                    background: #1E293B;
                    border-radius: 12px;
                    border: 1px solid #334155;
                    padding: 28px;
                    margin-bottom: 24px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                }

                .ba-title {
                    font-size: 17px;
                    font-weight: 700;
                    color: #F1F5F9;
                    margin-bottom: 24px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .ba-steps {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 24px;
                    flex-wrap: wrap;
                }

                .ba-step {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    color: #475569;
                }

                .ba-step.done { color: #2DD4BF; }

                .ba-step-num {
                    width: 22px;
                    height: 22px;
                    border-radius: 50%;
                    background: #263347;
                    color: #64748B;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 11px;
                    font-weight: 700;
                }

                .ba-step.done .ba-step-num {
                    background: #0D9488;
                    color: white;
                }

                .ba-step-arrow { color: #334155; font-size: 10px; }

                .ba-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #CBD5E1;
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .ba-select {
                    width: 100%;
                    padding: 11px 14px;
                    border-radius: 8px;
                    border: 1.5px solid #334155;
                    font-size: 14px;
                    outline: none;
                    color: #F1F5F9;
                    background: #0F172A;
                    cursor: pointer;
                    transition: border-color 0.2s;
                    margin-bottom: 16px;
                }

                .ba-select:focus { border-color: #0D9488; }

                .ba-date {
                    width: 100%;
                    padding: 11px 14px;
                    border-radius: 8px;
                    border: 1.5px solid #334155;
                    font-size: 14px;
                    outline: none;
                    color: #F1F5F9;
                    background: #0F172A;
                    cursor: pointer;
                    transition: border-color 0.2s;
                    margin-bottom: 16px;
                    color-scheme: dark;
                }

                .ba-date:focus { border-color: #0D9488; }

                .ba-slots {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                    margin-bottom: 20px;
                }

                .ba-slot {
                    padding: 10px 18px;
                    border-radius: 8px;
                    border: 2px solid #334155;
                    background: #0F172A;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 600;
                    color: #CBD5E1;
                    transition: all 0.2s;
                }

                .ba-slot:hover { border-color: #0D9488; color: #2DD4BF; }

                .ba-slot.selected {
                    border-color: #0D9488;
                    background: rgba(13,148,136,0.1);
                    color: #2DD4BF;
                }

                .ba-no-slots {
                    color: #FCA5A5;
                    font-size: 13px;
                    margin-bottom: 16px;
                }

                .ba-confirm-btn {
                    background: #0D9488;
                    color: white;
                    border: none;
                    padding: 13px 32px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 15px;
                    font-weight: 600;
                    box-shadow: 0 4px 12px rgba(13,148,136,0.25);
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .ba-confirm-btn:hover { background: #0F766E; transform: translateY(-1px); }
                .ba-confirm-btn:disabled { background: #334155; color: #64748B; cursor: not-allowed; transform: none; box-shadow: none; }

                @media (max-width: 480px) {
                    .ba-wrapper { padding: 16px; }
                    .ba-slots { gap: 8px; }
                    .ba-slot { padding: 8px 12px; font-size: 12px; }
                }
            `}</style>

            <div className="ba-wrapper">
                <div className="ba-title">📋 Book New Appointment</div>

                {/* Progress Steps */}
                <div className="ba-steps">
                    {steps.map((s, i) => (
                        <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className={`ba-step ${s.done ? 'done' : ''}`}>
                                <div className="ba-step-num">
                                    {s.done ? '✓' : s.num}
                                </div>
                                {s.label}
                            </div>
                            {i < steps.length - 1 && <span className="ba-step-arrow">→</span>}
                        </div>
                    ))}
                </div>

                {/* Department */}
                <div className="ba-label">1. Select Department</div>
                <select
                    className="ba-select"
                    value={selectedDept}
                    onChange={e => setSelectedDept(e.target.value)}>
                    <option value="">-- Choose a department --</option>
                    {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>

                {/* Doctor */}
                {selectedDept && (
                    <>
                        <div className="ba-label">2. Select Doctor</div>
                        <select
                            className="ba-select"
                            value={selectedDoctor}
                            onChange={e => setSelectedDoctor(e.target.value)}>
                            <option value="">-- Choose a doctor --</option>
                            {doctors.map(d => (
                                <option key={d.id} value={d.id}>
                                    Dr. {d.name} — {d.specialization}
                                </option>
                            ))}
                        </select>
                    </>
                )}

                {/* Date */}
                {selectedDoctor && (
                    <>
                        <div className="ba-label">3. Select Date</div>
                        <input
                            className="ba-date"
                            type="date"
                            value={selectedDate}
                            onChange={e => setSelectedDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </>
                )}

                {/* Slots */}
                {selectedDoctor && selectedDate && (
                    <>
                        <div className="ba-label">4. Select Time Slot</div>
                        {slots.length === 0 ? (
                            <p className="ba-no-slots">⚠️ No available slots for this date.</p>
                        ) : (
                            <div className="ba-slots">
                                {slots.map(s => (
                                    <button
                                        key={s.id}
                                        className={`ba-slot ${selectedSlot === s.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedSlot(s.id)}>
                                        🕐 {s.startTime} - {s.endTime}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Confirm */}
                {selectedSlot && (
                    <button
                        className="ba-confirm-btn"
                        onClick={handleBook}
                        disabled={loading}>
                        {loading ? '⏳ Booking...' : '✅ Confirm Appointment'}
                    </button>
                )}
            </div>
        </>
    );
}

export default BookAppointment;