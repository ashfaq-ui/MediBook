import PageHeader from '../../../components/PageHeader';
import PreviewForm from '../../../components/PreviewForm';
import FormField from '../../../components/FormField';
import EmptyTable from '../../../components/EmptyTable';

export const metadata = { title: "Available slots" };

export default function Page() {
    return (
        <div>
            <PageHeader title="Available slots" description="Set the dates and times when patients can book appointments." />
            <section className="panel">
                <h2>Add an available slot</h2>
                <PreviewForm submitLabel="Add time slot" notice="Availability management will be available soon.">
                    <FormField label="Date" name="date" type="date" />
                    <FormField label="Start time" name="startTime" type="time" />
                    <FormField label="End time" name="endTime" type="time" />
                </PreviewForm>
            </section>
            <EmptyTable caption="Available time slots" columns={['Date', 'Start time', 'End time', 'Status']}
                message="Your appointment time slots will appear here when this feature is available." />
        </div>
    );
}
