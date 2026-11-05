'use client';
import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import FormField from '../components/FormField';
import { ActionForm } from './shared';
import { api } from '../lib/api';
export default function Assistant() {
    const [messages, setMessages] = useState([]), [useAi, setUseAi] = useState(false);
    return <><PageHeader title="Clinic assistant" description="Help with booking, cancelling, and rescheduling appointments." /><p>Clinic help provides appointment guidance. Optional AI can provide general information and can make mistakes; it does not diagnose or prescribe. Contact a clinician for personal medical advice.</p>
        <section aria-label="Conversation" aria-live="polite">{messages.map((m, i) => <div className="panel" key={i}><p><strong>You:</strong> {m.question}</p><p><strong>MediBook:</strong> {m.reply}</p></div>)}</section>
        <ActionForm label="Ask" reset action={async ({ message }) => { const result = await api('/patient/health-assistant', { method: 'POST', timeoutMs: 70000, body: { message, useAi, consent: useAi } }); setMessages(previous => [...previous, { question: message, reply: result.reply }]); return { message: 'Response received.' }; }}><label className="check-field"><input type="checkbox" checked={useAi} onChange={e => setUseAi(e.target.checked)} /> Use AI: I consent to sending this question to the clinic-configured model. Do not enter identifying information.</label><FormField label="Your question" name="message" type="textarea" maxLength={2000} required /></ActionForm>
    </>;
}
