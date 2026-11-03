import PageHeader from '../../../components/PageHeader';
import PreviewForm from '../../../components/PreviewForm';
import FormField from '../../../components/FormField';

export const metadata = { title: "Appointment summary" };

export default function Page() {
    return (
        <div>
            <PageHeader title="Appointment summary" description="Review clinical summaries for your patient appointments." />
            <PreviewForm submitLabel="Generate summary" notice="Appointment summaries will be available soon.">
                <FormField label="Appointment" name="appointmentId" type="select" placeholder="Choose an appointment" disabled />
            </PreviewForm>
            <section className="panel">
                <h2>Clinical summary</h2>
                <p className="empty-message">Appointment summaries will appear here when this feature is available.</p>
            </section>
        </div>
    );
}
