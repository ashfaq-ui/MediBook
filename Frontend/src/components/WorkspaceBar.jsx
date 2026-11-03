'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from './Icon';
import { workspaceLinks } from '../lib/navigation';

export default function WorkspaceBar({ title, items }) {
    const pathname = usePathname();
    const current = items.find(item => item.href === pathname)?.label || 'Dashboard';
    return (
        <header className="workspace-bar">
            <div className="breadcrumbs"><span>{title}</span><span className="breadcrumb-divider">/</span><strong>{current}</strong></div>
            <div className="workspace-tools">
                <span className="preview-badge"><span /> Preview</span>
                <details className="workspace-switcher">
                    <summary><Icon name="grid" size={16} /><span>Switch workspace</span><Icon name="chevron" size={15} /></summary>
                    <nav aria-label="Switch workspace">{workspaceLinks.map(item => <Link key={item.href} href={item.href}>{item.label} workspace<Icon name="arrow" size={15} /></Link>)}</nav>
                </details>
            </div>
        </header>
    );
}
