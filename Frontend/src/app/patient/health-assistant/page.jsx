import PageHeader from '../../../components/PageHeader';
import PreviewForm from '../../../components/PreviewForm';
import FormField from '../../../components/FormField';

export const metadata = { title: "Health assistant" };

export default function Page() {
    return (
        <div>
            <PageHeader title="Health assistant" description="A space for general health questions and appointment preparation." />
            <section className="panel">
                <h2>Your conversation</h2>
                <p className="empty-message">The health assistant will be available here soon.</p>
            </section>
            <PreviewForm submitLabel="Send message" notice="Messaging will be available when the health assistant opens.">
                <FormField label="Your question" name="message" type="textarea" placeholder="Write your question" />
            </PreviewForm>
        </div>
    );
}
