'use client';
import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import FormField from '../components/FormField';
import { ActionForm, DataTable, Notice, Status, useResource } from './shared';
import { api } from '../lib/api';
export default function Availability() {
    const resource = useResource('/doctor/slots'); const [error, setError] = useState('');
    return <><PageHeader title="Manage availability" description="Add working hours as individual slots. Omit breaks and leave dates. Times use the clinic timezone, Asia/Colombo." />
        <ActionForm label="Add availability" action={body => api('/doctor/slots', { method: 'POST', body })} onSuccess={resource.reload} reset>
            <FormField name="date" label="Date" type="date" required /><FormField name="startTime" label="Start time" type="time" required /><FormField name="endTime" label="End time" type="time" required /><FormField name="duration" label="Appointment duration (minutes)" type="number" min={5} max={240} defaultValue={30} required />
        </ActionForm><Notice error={error} /><Status resource={resource}><DataTable rows={resource.data || []} columns={[[ 'date', 'Date' ], ['start_time', 'Start'], ['end_time', 'End'], ['booked', 'Booked']]} actions={s => <button disabled={s.booked} onClick={async () => { if (!window.confirm('Remove this slot?')) return; try { await api(`/doctor/slots/${s.id}`, { method: 'DELETE' }); setError(''); resource.reload(); } catch (e) { setError(e.message); } }}>Remove</button>} /></Status>
    </>;
}
