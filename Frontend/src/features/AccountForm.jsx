'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import FormField from '../components/FormField';
import { ActionForm } from './shared';
import { api } from '../lib/api';

export default function AccountForm({ mode }) {
    const router = useRouter();
    const [token, setToken] = useState('');
    useEffect(() => { const value = window.location.hash.slice(1); if (value) { queueMicrotask(() => setToken(value)); window.history.replaceState(null, '', window.location.pathname); } }, []);
    const register = mode === 'register', login = mode === 'login', reset = mode === 'reset-password';
    return <><ActionForm label={register ? 'Create account' : login ? 'Sign in' : reset ? 'Reset password' : 'Send reset email'} action={async values => {
        const result = await api(`/auth/${mode}`, { method: 'POST', body: { ...values, token, remember: values.remember === 'on' } });
        if (register || login) router.replace(`/${result.role.toLowerCase()}/dashboard`);
        return result;
    }}>
        {register && <FormField label="Full name" name="name" autoComplete="name" maxLength={255} required />}
        {!reset && <FormField label="Email address" name="email" type="email" autoComplete="email" required />}
        {(register || login || reset) && <FormField label="Password" name="password" type="password" autoComplete={login ? 'current-password' : 'new-password'} minLength={login ? undefined : 10} maxLength={72} required />}
        {(register || reset) && <FormField label="Confirm password" name="confirmPassword" type="password" autoComplete="new-password" required />}
        {login && <label className="check-field"><input name="remember" type="checkbox" /> Keep me signed in for 30 days</label>}
        {register && <p>Patient registration. Clinic administrators create staff accounts.</p>}
        {reset && <input name="token" value={token} type="hidden" />}
    </ActionForm><p className="inline-links">{login ? <><Link href="/register">Create an account</Link><Link href="/forgot-password">Forgot password?</Link></> : <Link href="/login">Back to sign in</Link>}</p></>;
}
