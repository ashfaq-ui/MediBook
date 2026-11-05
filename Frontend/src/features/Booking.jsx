'use client';
import { useState } from 'react';
import Link from 'next/link';
import PageHeader from '../components/PageHeader';
import FormField from '../components/FormField';
import { ActionForm, Status, useResource } from './shared';
import { api } from '../lib/api';

export default function Booking() {
    const departments = useResource('/departments');
    const [department, setDepartment] = useState(''), [doctor, setDoctor] = useState(''), [date, setDate] = useState(''), [booked, setBooked] = useState(false);
    const doctors = useResource(department ? `/doctors?departmentId=${department}` : null);
    const slots = useResource(doctor && date ? `/slots?doctorId=${doctor}&date=${date}` : null);
    return <><PageHeader title="Book an appointment" description="Choose a department, doctor, and available time. Times use the clinic timezone, Asia/Colombo." />
        <Status resource={departments}><div className="page-form">
            <FormField label="Department" name="department" type="select" value={department} options={(departments.data || []).map(d => ({ value: d.id, label: d.name }))} onChange={e => { setDepartment(e.target.value); setDoctor(''); setDate(''); setBooked(false); }} />
            {department && <Status resource={doctors}><FormField label="Doctor" name="doctor" type="select" value={doctor} options={(doctors.data || []).map(d => ({ value: d.id, label: `${d.name} — ${d.specialization}` }))} onChange={e => { setDoctor(e.target.value); setBooked(false); }} />{doctors.data?.length === 0 && <p>No doctors are available in this department.</p>}</Status>}
            {doctor && <FormField label="Appointment date" name="date" type="date" value={date} onChange={e => { setDate(e.target.value); setBooked(false); }} />}
        </div></Status>
        {doctor && date && <Status resource={slots}>{slots.data?.length ? <ActionForm key={`${doctor}-${date}`} label="Confirm booking" action={values => api('/patient/appointments', { method: 'POST', body: values })} onSuccess={() => { slots.reload(); setBooked(true); }}>
            <FormField label="Time" name="slotId" type="select" required options={slots.data.map(s => ({ value: s.id, label: `${s.start_time} – ${s.end_time}` }))} />
            <FormField label="Reason for visit (optional)" name="notes" type="textarea" maxLength={255} />
        </ActionForm> : <p>No available slots for this date. Choose another date or doctor.</p>}</Status>}
        {booked && <p role="status">Appointment booked. <Link href="/patient/appointments">View your appointments</Link></p>}
    </>;
}
