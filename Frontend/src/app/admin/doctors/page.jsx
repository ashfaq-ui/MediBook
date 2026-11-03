import PageHeader from '../../../components/PageHeader';
import PreviewForm from '../../../components/PreviewForm';
import FormField from '../../../components/FormField';
import EmptyTable from '../../../components/EmptyTable';

export const metadata = { title: "Doctors" };

export default function Page() {
    return (
        <div>
            <PageHeader title="Doctors" description="Assign doctor profiles and organize their department details." />
            <section className="panel">
                <h2>Assign a doctor profile</h2>
                <PreviewForm submitLabel="Assign doctor" notice="Doctor profile management will be available soon.">
                    <FormField label="Doctor account" name="userId" type="select" placeholder="Choose a doctor account" disabled />
                    <FormField label="Department" name="departmentId" type="select" placeholder="Choose a department" disabled />
                    <FormField label="Specialization" name="specialization" />
                    <FormField label="Phone number" name="phone" type="tel" autoComplete="tel" />
                </PreviewForm>
            </section>
            <EmptyTable caption="Clinic doctors" columns={['Name', 'Department', 'Specialization', 'Phone']}
                message="The doctor list will be available here soon." />
        </div>
    );
}
