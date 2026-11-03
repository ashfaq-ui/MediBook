import PageHeader from '../../../components/PageHeader';
import EmptyTable from '../../../components/EmptyTable';

export const metadata = { title: "Patient appointments" };

export default function Page() {
    return (
        <div>
            <PageHeader title="Patient appointments" description="Review patient bookings and appointment statuses." />
            <EmptyTable caption="Patient appointments" columns={['Patient', 'Date', 'Time', 'Status', 'Summary']}
                message="Patient appointments will appear here when this feature is available." />
        </div>
    );
}
