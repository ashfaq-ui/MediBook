'use client';
import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import FormField from '../components/FormField';

export function useResource(path) {
    const [state, setState] = useState({ path: null, data: null, error: '', loading: true });
    const [revision, setRevision] = useState(0);
    const reload = useCallback(() => setRevision(v => v + 1), []);
    useEffect(() => {
        let alive = true;
        if (!path) return;
        api(path).then(data => { if (alive) setState({ path, data, error: '', loading: false }); })
            .catch(error => { if (alive) setState({ path, data: null, error: error.message, loading: false }); });
        return () => { alive = false; };
    }, [path, revision]);
    return state.path === path ? { ...state, reload } : { data: null, error: '', loading: Boolean(path), reload };
}
export function Status({ resource, children }) {
    if (resource.loading) return <p role="status">Loading…</p>;
    if (resource.error) return <div role="alert"><p>{resource.error}</p><button onClick={resource.reload}>Try again</button></div>;
    return children;
}
export function Notice({ error, message }) {
    return <>{error && <p className="action-error" role="alert">{error}</p>}{message && <p className="action-success" role="status">{message}</p>}</>;
}
export function ActionForm({ action, children, label = 'Save', onSuccess, reset = false }) {
    const [pending, setPending] = useState(false), [error, setError] = useState(''), [message, setMessage] = useState('');
    async function submit(event) {
        event.preventDefault(); const form = event.currentTarget;
        setPending(true); setError(''); setMessage('');
        try {
            const result = await action(Object.fromEntries(new FormData(form)));
            setMessage(result?.message || 'Saved.'); if (reset) form.reset(); onSuccess?.(result);
        } catch (e) { setError(e.message); } finally { setPending(false); }
    }
    return <form className="page-form live-form" onSubmit={submit}><fieldset disabled={pending}>{children}</fieldset><Notice error={error} message={message} /><button type="submit" disabled={pending}>{pending ? 'Saving…' : label}</button></form>;
}
export function DataTable({ rows, columns, actions }) {
    return <div className="table-wrap"><table><thead><tr>{columns.map(([key, title]) => <th key={key} scope="col">{title}</th>)}{actions && <th scope="col">Actions</th>}</tr></thead><tbody>{rows.length ? rows.map(row => <tr key={row.id}>{columns.map(([key]) => <td key={key}>{typeof row[key] === 'boolean' ? (row[key] ? 'Yes' : 'No') : row[key] ?? '—'}</td>)}{actions && <td><div className="record-actions">{actions(row)}</div></td>}</tr>) : <tr><td colSpan={columns.length + (actions ? 1 : 0)}>No records found.</td></tr>}</tbody></table></div>;
}
export function Field({ field, record = {} }) {
    const { key, label, type = 'text', options, required = true } = field;
    if (type === 'checkbox') return <label className="check-field"><input type="checkbox" name={key} defaultChecked={record[key] ?? true} /> {label}</label>;
    return <FormField name={key} label={label} type={type} options={options} defaultValue={record[key] ?? ''} required={required} minLength={type === 'password' ? 10 : undefined} maxLength={type === 'password' ? 72 : type === 'textarea' ? 10000 : 255} />;
}
