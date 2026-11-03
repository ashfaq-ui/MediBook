import Link from 'next/link';
import AuthLayout from '../../components/AuthLayout';
import PreviewForm from '../../components/PreviewForm';
import FormField from '../../components/FormField';

export const metadata = { title: "Create an account" };

export default function Page() {
    return (
        <AuthLayout title="Let’s get you started." description="A simpler way to connect with your care starts here.">
            <PreviewForm submitLabel="Create account" notice="Registration will be available soon.">
                <FormField label="Full name" name="name" autoComplete="name" required />
                <FormField label="Email address" name="email" type="email" autoComplete="email" required />
                <FormField label="Password" name="password" type="password" autoComplete="new-password" required />
                <FormField label="Confirm password" name="confirmPassword" type="password" autoComplete="new-password" required />
                <FormField label="Account type" name="role" type="select" options={[
                    { value: 'PATIENT', label: 'Patient' }, { value: 'DOCTOR', label: 'Doctor' },
                ]} required />
            </PreviewForm>
            <p className="inline-links">Already registered? <Link href="/login">Sign in</Link></p>
        </AuthLayout>
    );
}
