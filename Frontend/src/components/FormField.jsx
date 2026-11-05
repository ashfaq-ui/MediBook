'use client';

import { useState } from 'react';
import Icon from './Icon';

export default function FormField({ label, name, type = 'text', options = [], placeholder, ...props }) {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const icon = type === 'email' ? 'mail' : type === 'password' ? 'lock' : type === 'date' ? 'calendar' : type === 'time' ? 'clock' : type === 'tel' ? 'phone' : name === 'name' ? 'user' : null;
    return (
        <label className={`form-field${type === 'textarea' ? ' textarea-field' : ''}`}>
            <span>{label}{props.required && <span className="required-marker"> *</span>}</span>
            <span className={`field-control${icon ? ' has-icon' : ''}${type === 'password' ? ' password-control' : ''}`}>
                {icon && <Icon className="input-icon" name={icon} size={18} />}
                {type === 'select' ? (
                    <><select name={name} defaultValue={props.value === undefined ? '' : undefined} {...props}>
                        <option value="" disabled>{placeholder || 'Choose an option'}</option>
                        {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select><Icon className="select-chevron" name="chevron" size={16} /></>
                ) : type === 'textarea' ? (
                    <textarea name={name} placeholder={placeholder} rows={4} {...props} />
                ) : (
                    <input name={name} type={type === 'password' && passwordVisible ? 'text' : type} placeholder={placeholder || (type === 'email' ? 'you@example.com' : type === 'password' ? 'Enter your password' : undefined)} {...props} />
                )}
                {type === 'password' && <button className="password-toggle" type="button" aria-label={passwordVisible ? 'Hide password' : 'Show password'} aria-pressed={passwordVisible} onClick={() => setPasswordVisible(!passwordVisible)}><Icon name="eye" size={18} /></button>}
            </span>
        </label>
    );
}
