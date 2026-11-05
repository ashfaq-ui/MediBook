import AuthLayout from '../../components/AuthLayout';
import AccountForm from '../../features/AccountForm';
export const metadata = { title: 'Choose a new password' };
export default function Page() { return <AuthLayout title="Choose a new password" description="Use the reset link from your email."><AccountForm mode="reset-password" /></AuthLayout>; }
