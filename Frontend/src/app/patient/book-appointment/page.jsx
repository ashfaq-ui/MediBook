import PageHeader from '../../../components/PageHeader';
import PreviewForm from '../../../components/PreviewForm';
import FormField from '../../../components/FormField';

export const metadata = { title: "Book an appointment" };

export default function Page() {
    return (
        <div>
            <PageHeader title="Book an appointment" description="Choose a department, doctor, and available appointment time." />
            <PreviewForm submitLabel="Book appointment" notice="Appointment booking will be available soon.">
                <FormField label="Department" name="departmentId" type="select" placeholder="Choose a department" disabled />
                <FormField label="Doctor" name="doctorId" type="select" placeholder="Choose a doctor" disabled />
                <FormField label="Appointment date" name="date" type="date" />
                <FormField label="Time slot" name="slotId" type="select" placeholder="Choose an available time" disabled />
            </PreviewForm>
        </div>
    );
}
