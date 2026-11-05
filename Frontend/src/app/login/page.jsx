import AuthLayout from '../../components/AuthLayout';
import AccountForm from '../../features/AccountForm';
export const metadata = { title: 'Sign in' };
export default function Page() { return <AuthLayout title="Sign in" description="Sign in to manage your care."><AccountForm mode="login" /></AuthLayout>; }
