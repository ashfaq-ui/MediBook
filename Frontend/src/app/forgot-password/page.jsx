import AuthLayout from '../../components/AuthLayout';
import AccountForm from '../../features/AccountForm';
export const metadata = { title: 'Reset your password' };
export default function Page() { return <AuthLayout title="Reset your password" description="Request a password reset email."><AccountForm mode="forgot-password" /></AuthLayout>; }
