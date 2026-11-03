import PageHeader from '../../../components/PageHeader';
import EmptyTable from '../../../components/EmptyTable';

export const metadata = { title: "All appointments" };

export default function Page() {
    return (
        <div>
            <PageHeader title="All appointments" description="Review appointment bookings across the clinic." />
            <EmptyTable caption="All clinic appointments" columns={['Patient', 'Doctor', 'Department', 'Date', 'Time', 'Status']}
                message="The clinic appointment list will be available here soon." />
        </div>
    );
}
