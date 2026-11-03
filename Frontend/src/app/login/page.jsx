import Link from 'next/link';
import AuthLayout from '../../components/AuthLayout';
import PreviewForm from '../../components/PreviewForm';
import FormField from '../../components/FormField';

export const metadata = { title: "Sign in" };

export default function Page() {
    return (
        <AuthLayout title="Welcome back." description="A familiar place for your appointments and your peace of mind.">
            <PreviewForm submitLabel="Sign in" notice="Sign-in will be available soon.">
                <FormField label="Email address" name="email" type="email" autoComplete="email" required />
                <FormField label="Password" name="password" type="password" autoComplete="current-password" required />
            </PreviewForm>
            <p className="inline-links">New to MediBook? <Link href="/register">Create an account</Link></p>
        </AuthLayout>
    );
}
