import AuthLayout from '../../components/AuthLayout';
import AccountForm from '../../features/AccountForm';
export const metadata = { title: 'Create an account' };
export default function Page() { return <AuthLayout title="Create an account" description="Register for a patient account."><AccountForm mode="register" /></AuthLayout>; }
