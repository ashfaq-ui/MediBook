import PageHeader from '../../../components/PageHeader';
import PreviewForm from '../../../components/PreviewForm';
import FormField from '../../../components/FormField';
import EmptyTable from '../../../components/EmptyTable';

export const metadata = { title: "Departments" };

export default function Page() {
    return (
        <div>
            <PageHeader title="Departments" description="Organize the departments within your clinic." />
            <section className="panel">
                <h2>Add a department</h2>
                <PreviewForm submitLabel="Add department" notice="Department management will be available soon.">
                    <FormField label="Department name" name="name" />
                    <FormField label="Description" name="description" type="textarea" />
                </PreviewForm>
            </section>
            <EmptyTable caption="Clinic departments" columns={['Name', 'Description']}
                message="The department list will be available here soon." />
        </div>
    );
}
