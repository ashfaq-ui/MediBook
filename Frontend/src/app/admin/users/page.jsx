import PageHeader from '../../../components/PageHeader';
import EmptyTable from '../../../components/EmptyTable';

export const metadata = { title: "Users" };

export default function Page() {
    return (
        <div>
            <PageHeader title="Users" description="View the patient, doctor, and admin accounts in your clinic." />
            <EmptyTable caption="Clinic users" columns={['Name', 'Email', 'Role']}
                message="The user list will be available here soon." />
        </div>
    );
}
