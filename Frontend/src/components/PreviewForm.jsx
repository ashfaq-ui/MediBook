'use client';

import { useId } from 'react';
import Icon from './Icon';

export default function PreviewForm({ children, submitLabel, notice }) {
    const noticeId = useId();
    return (
        <form className="page-form" aria-describedby={noticeId} onSubmit={event => event.preventDefault()}>
            {children}
            <p className="form-notice" id={noticeId}><Icon name="info" size={16} />{notice}</p>
            <button type="submit" disabled>{submitLabel}<Icon name="arrow" size={17} /></button>
        </form>
    );
}
