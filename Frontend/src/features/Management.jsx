'use client';
import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import FormField from '../components/FormField';
import { ActionForm, DataTable, Field, Notice, Status, useResource } from './shared';
import { api } from '../lib/api';
export default function Management({ kind }) {
    const resource = useResource(kind === 'departments' ? '/departments' : `/admin/${kind}`);
    const departments = useResource('/departments');
    const [editing, setEditing] = useState(null), [creating, setCreating] = useState(false), [search, setSearch] = useState(''), [error, setError] = useState('');
    const fields = kind === 'departments' ? [{ key: 'name', label: 'Department name' }, { key: 'description', label: 'Description', required: false }] : kind === 'doctors' ? [
        { key: 'name', label: 'Full name' }, { key: 'departmentId', label: 'Department', type: 'select', options: (departments.data || []).map(d => ({ value: d.id, label: d.name })) }, { key: 'specialization', label: 'Specialization' }, { key: 'phone', label: 'Phone', type: 'tel', required: false },
    ] : [{ key: 'name', label: 'Full name' }];
    if (creating && kind !== 'departments') fields.push({ key: 'email', label: 'Email', type: 'email' }, { key: 'password', label: 'Initial password (at least 10 characters)', type: 'password' });
    if (kind === 'users' && (creating || editing?.role !== 'DOCTOR')) fields.push({ key: 'role', label: 'Role', type: 'select', options: [{ value: 'PATIENT', label: 'Patient' }, { value: 'ADMIN', label: 'Administrator' }] });
    if (editing && kind !== 'departments') fields.push({ key: 'active', label: 'Account active', type: 'checkbox' });
    const columns = kind === 'departments' ? [['name', 'Department'], ['description', 'Description']] : kind === 'doctors' ? [['name', 'Doctor'], ['email', 'Email'], ['department_name', 'Department'], ['specialization', 'Specialization'], ['active', 'Active']] : [['name', 'Name'], ['email', 'Email'], ['role', 'Role'], ['active', 'Active']];
    const rows = (resource.data || []).filter(r => columns.some(([key]) => String(r[key] || '').toLowerCase().includes(search.toLowerCase())));
    return <><PageHeader title={`Manage ${kind}`} description={kind === 'users' ? 'Create patient and administrator accounts. Manage doctor accounts under Doctors.' : 'Changes are saved to the clinic database.'} />
        <div className="record-filters"><FormField name="search" label="Search" value={search} onChange={e => setSearch(e.target.value)} /><button onClick={() => { setEditing(null); setCreating(true); }}>Add {kind === 'departments' ? 'department' : kind === 'doctors' ? 'doctor' : 'user'}</button></div>
        {(creating || editing) && <><button onClick={() => { setEditing(null); setCreating(false); }}>Close form</button><ActionForm key={editing?.id || 'new'} label={creating ? 'Create' : 'Save changes'} action={values => api(`/admin/${kind}${editing ? `/${editing.id}` : ''}`, { method: editing ? 'PUT' : 'POST', body: { ...values, active: values.active === 'on' } })} onSuccess={() => { resource.reload(); setEditing(null); setCreating(false); }}>
            {fields.map(field => <Field key={field.key} field={field} record={editing ? { ...editing, departmentId: editing.department_id } : {}} />)}
        </ActionForm></>}
        <Notice error={error} /><Status resource={resource}><DataTable rows={rows} columns={columns} actions={row => <><button onClick={() => { setEditing(row); setCreating(false); }}>Edit</button>{kind === 'departments' && <button onClick={async () => { if (!window.confirm(`Delete ${row.name}? Linked departments cannot be deleted.`)) return; try { await api(`/admin/departments/${row.id}`, { method: 'DELETE' }); setError(''); resource.reload(); } catch (e) { setError(e.message); } }}>Delete</button>}</>} /></Status>
    </>;
}
