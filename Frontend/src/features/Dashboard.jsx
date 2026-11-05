'use client';
import Link from 'next/link';
import PageHeader from '../components/PageHeader';
import { useAccount } from './AccessGate';
import { DataTable, Status, useResource } from './shared';
export default function Dashboard({ role }) {
    const resource = useResource(`/${role}/dashboard`); const account = useAccount();
    return <><PageHeader title={`Welcome, ${account?.name || ''}`} description="Your appointments and clinic activity." /><Status resource={resource}>
        <div className="stats-grid">{['CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].map(status => <div key={status} className="stat-card"><p>{status}</p><strong>{resource.data?.counts.find(c => c.status === status)?.total || 0}</strong></div>)}</div>
        <p>Clinic timezone: {resource.data?.timezone}. Email notifications: {resource.data?.emailEnabled ? 'Enabled' : 'Not configured'}.</p>
        <p className="inline-links"><Link href={`/${role}/appointments`}>View all appointments</Link>{role === 'patient' && <Link href="/patient/book-appointment">Book an appointment</Link>}{role === 'doctor' && <Link href="/doctor/slots">Manage availability</Link>}{role === 'admin' && <><Link href="/admin/departments">Manage departments</Link><Link href="/admin/doctors">Manage doctors</Link></>}</p>
        <h2>Upcoming appointments</h2><DataTable rows={resource.data?.upcoming || []} columns={[[ 'id', 'Reference' ], ['date', 'Date'], ['start_time', 'Time'], ['patient_name', 'Patient'], ['doctor_name', 'Doctor']]} />
    </Status></>;
}
