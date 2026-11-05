'use client';
import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import FormField from '../components/FormField';
import { ActionForm, DataTable, Notice, Status, useResource } from './shared';
import { api } from '../lib/api';

function Reschedule({ appointment, onSuccess }) {
    const slots = useResource(`/slots?doctorId=${appointment.doctor_id}`);
    return <Status resource={slots}>{slots.data?.length ? <ActionForm label="Confirm new time" action={body => api(`/patient/appointments/${appointment.id}/reschedule`, { method: 'POST', body })} onSuccess={onSuccess}>
        <h2>Reschedule appointment #{appointment.id}</h2><FormField label="New time" name="slotId" type="select" required options={slots.data.map(s => ({ value: s.id, label: `${s.date} ${s.start_time} – ${s.end_time}` }))} />
    </ActionForm> : <p>No alternative slots are currently available.</p>}</Status>;
}
function Summary({ appointment: a, onSuccess }) {
    const [complete, setComplete] = useState(false);
    return <ActionForm key={a.id} label={complete ? 'Save and complete consultation' : 'Save summary'} action={values => api(`/doctor/appointments/${a.id}/${complete ? 'complete' : 'summary'}`, { method: complete ? 'POST' : 'PUT', body: { ...values, shared: values.shared === 'on' } })} onSuccess={onSuccess}>
        <h2>Consultation #{a.id} — {a.patient_name}</h2>
        <FormField label="Diagnosis / consultation notes" name="diagnosis" type="textarea" defaultValue={a.diagnosis || a.ai_summary || ''} maxLength={10000} required />
        <FormField label="Prescription / care instructions" name="prescription" type="textarea" defaultValue={a.prescription || ''} maxLength={10000} />
        <FormField label="Follow-up date" name="followUp" type="date" defaultValue={a.follow_up || ''} />
        <label className="check-field"><input name="shared" type="checkbox" defaultChecked={a.shared} /> Share this summary with the patient</label>
        {['PENDING', 'CONFIRMED'].includes(a.status) && <label className="check-field"><input type="checkbox" checked={complete} onChange={e => setComplete(e.target.checked)} /> Mark consultation completed</label>}
    </ActionForm>;
}
export default function Appointments({ role, summaryOnly = false }) {
    const resource = useResource(`/${role}/appointments`);
    const [status, setStatus] = useState(''), [search, setSearch] = useState(''), [date, setDate] = useState(''), [selected, setSelected] = useState(null), [error, setError] = useState(''), [message, setMessage] = useState(''), [pending, setPending] = useState(false);
    const rows = (resource.data || []).filter(a => (!status || a.status === status) && (!date || a.date === date) && `${a.id} ${a.patient_name} ${a.doctor_name} ${a.department_name}`.toLowerCase().includes(search.toLowerCase()));
    async function cancel(a) {
        if (!window.confirm(`Cancel appointment #${a.id}?`)) return;
        setPending(true); setError(''); setMessage('');
        try { const result = await api(`/${role}/appointments/${a.id}/cancel`, { method: 'POST' }); setMessage(result.message); resource.reload(); setSelected(null); } catch (e) { setError(e.message); } finally { setPending(false); }
    }
    return <><PageHeader title={summaryOnly ? 'Consultation summaries' : 'Appointments'} description="Review appointments and manage your next steps. Times use the clinic timezone, Asia/Colombo." />
        <div className="record-filters"><FormField label="Search" name="search" value={search} onChange={e => setSearch(e.target.value)} /><label>Status<select value={status} onChange={e => setStatus(e.target.value)}><option value="">All</option>{['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].map(s => <option key={s}>{s}</option>)}</select></label><FormField label="Date" name="date" type="date" value={date} onChange={e => setDate(e.target.value)} /><button onClick={() => { setDate(''); setSearch(''); setStatus(''); }}>Clear filters</button></div>
        <Notice error={error} message={message} /><Status resource={resource}><DataTable rows={rows} columns={[[ 'id', 'Reference' ], ['date', 'Date'], ['start_time', 'Time'], ['patient_name', 'Patient'], ['doctor_name', 'Doctor'], ['status', 'Status']]} actions={a => <><button onClick={() => setSelected(a)}>View details</button>{role === 'doctor' && ['PENDING', 'CONFIRMED'].includes(a.status) && <button disabled={pending} onClick={async () => { if (!window.confirm('Mark this appointment as a no-show?')) return; setPending(true); try { const result = await api(`/doctor/appointments/${a.id}/no-show`, { method: 'POST' }); setMessage(result.message); setError(''); resource.reload(); setSelected(null); } catch (e) { setError(e.message); } finally { setPending(false); } }}>No-show</button>}{!summaryOnly && ['PENDING', 'CONFIRMED'].includes(a.status) && <button disabled={pending} onClick={() => cancel(a)}>Cancel</button>}</>} /></Status>
        {selected && <section className="panel record-detail"><button onClick={() => setSelected(null)}>Close details</button><h2>Appointment #{selected.id}</h2><p>{selected.patient_name} · {selected.doctor_name} · {selected.department_name}</p><p>{selected.date} {selected.start_time} – {selected.end_time} · {selected.status}</p><p>Reason: {selected.notes || 'Not provided'}</p>
            {role === 'patient' && ['PENDING', 'CONFIRMED'].includes(selected.status) && <Reschedule appointment={selected} onSuccess={() => { resource.reload(); setSelected(null); setMessage('Appointment rescheduled.'); }} />}
            {role === 'doctor' && !['CANCELLED', 'NO_SHOW'].includes(selected.status) && <Summary appointment={selected} onSuccess={() => { resource.reload(); setSelected(null); setMessage('Consultation saved.'); }} />}
            {role !== 'doctor' && (selected.diagnosis || selected.ai_summary) && <div><h3>Consultation summary</h3><p className="preserve-lines">{selected.diagnosis || selected.ai_summary}</p><p className="preserve-lines">{selected.prescription}</p><p>Follow-up: {selected.follow_up || 'Not specified'}</p></div>}
        </section>}
    </>;
}
