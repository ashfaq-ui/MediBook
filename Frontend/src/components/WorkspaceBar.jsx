'use client';

import { usePathname } from 'next/navigation';
import Icon from './Icon';
import { AccountControls } from '../features/AccessGate';

export default function WorkspaceBar({ title, items }) {
    const pathname = usePathname();
    const current = items.find(item => item.href === pathname)?.label || 'Dashboard';
    return (
        <header className="workspace-bar">
            <div className="breadcrumbs"><span>{title}</span><span className="breadcrumb-divider">/</span><strong>{current}</strong></div>
            <div className="workspace-tools">
                <AccountControls />
            </div>
        </header>
    );
}
