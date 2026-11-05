'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';
import { ActionForm } from './shared';
import FormField from '../components/FormField';
const AccountContext = createContext(null);
export const useAccount = () => useContext(AccountContext);
export default function AccessGate({ role, children }) {
    const [user, setUser] = useState(null), [error, setError] = useState('');
    const router = useRouter();
    useEffect(() => {
        let alive = true;
        api('/auth/me').then(user => {
            if (!alive) return;
            if (user.role.toLowerCase() !== role.toLowerCase()) router.replace(`/${user.role.toLowerCase()}/dashboard`);
            else setUser(user);
        }).catch(e => { if (!alive) return; if (e.status === 401) router.replace('/login'); else setError(e.message); });
        return () => { alive = false; };
    }, [role, router]);
    if (error) return <main className="panel"><p role="alert">{error}</p><button onClick={() => window.location.reload()}>Try again</button></main>;
    if (!user) return <main className="panel" role="status">Checking your account…</main>;
    return <AccountContext.Provider value={user}>{children}</AccountContext.Provider>;
}
export function AccountControls() {
    const user = useAccount(); const router = useRouter(); const [error, setError] = useState('');
    return <div><details><summary>Account settings</summary><ActionForm label="Change password" action={body => api('/auth/change-password', { method: 'POST', body })} reset><FormField label="Current password" name="currentPassword" type="password" autoComplete="current-password" required /><FormField label="New password" name="password" type="password" autoComplete="new-password" minLength={10} maxLength={72} required /><FormField label="Confirm new password" name="confirmPassword" type="password" autoComplete="new-password" required /></ActionForm></details><span>{user?.name} · {user?.role}</span> <button onClick={async () => { try { await api('/auth/logout', { method: 'POST' }); router.replace('/login'); } catch (e) { setError(e.message); } }}>Sign out</button>{error && <p role="alert">{error}</p>}</div>;
}
