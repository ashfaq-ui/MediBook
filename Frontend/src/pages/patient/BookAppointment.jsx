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

    useEffect(() => {
        api.get('/departments').then(res => setDepartments(res.data));
    }, []);

    useEffect(() => {
        if (selectedDept) {
            api.get(`/doctors/department/${selectedDept}`)
                .then(res => setDoctors(res.data));
            setSelectedDoctor('');
            setSlots([]);
        }
    }, [selectedDept]);

    useEffect(() => {
        if (selectedDoctor && selectedDate) {
            api.get(`/slots/available?doctorId=${selectedDoctor}&date=${selectedDate}`)
                .then(res => setSlots(res.data));
        }
    }, [selectedDoctor, selectedDate]);

    const handleBook = async () => {
        if (!selectedSlot) return alert('Please select a time slot');
        try {
            await api.post('/appointments', {
                patientId: parseInt(patientId),
                doctorId: parseInt(selectedDoctor),
                slotId: parseInt(selectedSlot)
            });
            alert('Appointment booked successfully!');
            onBooked();
        } catch (err) {
            alert('Booking failed. Slot may already be taken.');
        }
    };

    return (
        <div style={{
            background: 'white', borderRadius: '8px',
            border: '1px solid #E2E8F0', padding: '24px', marginBottom: '24px'
        }}>
            <h4 style={{ marginTop: 0 }}>Book New Appointment</h4>

            {/* Step 1 - Department */}
            <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                    1. Select Department
                </label>
                <select
                    value={selectedDept}
                    onChange={e => setSelectedDept(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
                    <option value="">-- Select Department --</option>
                    {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>
            </div>

            {/* Step 2 - Doctor */}
            {doctors.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                        2. Select Doctor
                    </label>
                    <select
                        value={selectedDoctor}
                        onChange={e => setSelectedDoctor(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
                        <option value="">-- Select Doctor --</option>
                        {doctors.map(d => (
                            <option key={d.id} value={d.id}>Dr. {d.name} — {d.specialization}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Step 3 - Date */}
            {selectedDoctor && (
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                        3. Select Date
                    </label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                    />
                </div>
            )}

            {/* Step 4 - Time Slot */}
            {slots.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                        4. Select Time Slot
                    </label>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {slots.map(s => (
                            <button
                                key={s.id}
                                onClick={() => setSelectedSlot(s.id)}
                                style={{
                                    padding: '10px 16px', borderRadius: '6px', cursor: 'pointer',
                                    border: '2px solid',
                                    borderColor: selectedSlot === s.id ? '#0D9488' : '#CBD5E1',
                                    background: selectedSlot === s.id ? '#CCFBF1' : 'white',
                                    fontWeight: selectedSlot === s.id ? 'bold' : 'normal'
                                }}>
                                {s.startTime} - {s.endTime}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {slots.length === 0 && selectedDoctor && selectedDate && (
                <p style={{ color: '#EF4444' }}>No available slots for this date.</p>
            )}

            {/* Book Button */}
            {selectedSlot && (
                <button
                    onClick={handleBook}
                    style={{
                        background: '#0D9488', color: 'white', border: 'none',
                        padding: '12px 32px', borderRadius: '8px', cursor: 'pointer',
                        fontSize: '16px', fontWeight: 'bold'
                    }}>
                    Confirm Booking
                </button>
            )}
        </div>
    );
}

export default BookAppointment;