import Link from 'next/link';
import PageHeader from '../../../components/PageHeader';
import EmptyTable from '../../../components/EmptyTable';

export const metadata = { title: "My appointments" };

export default function Page() {
    return (
        <div>
            <PageHeader title="My appointments" description="Review upcoming and past appointments." />
            <EmptyTable caption="My appointments" columns={['Doctor', 'Department', 'Date', 'Time', 'Status']}
                message="Your appointments will appear here when this feature is available." />
            <div className="inline-links"><Link href="/patient/book-appointment">Book an appointment</Link></div>
        </div>
    );
}
