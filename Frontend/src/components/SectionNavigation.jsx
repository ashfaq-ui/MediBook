'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from './Icon';
import { iconForPath } from '../lib/navigation';

export default function SectionNavigation({ title, items }) {
    const pathname = usePathname();
    return (
        <nav className="section-navigation" aria-label={`${title} navigation`}>
            <p className="section-label">YOUR WORKSPACE</p>
            {items.map(item => (
                <Link key={item.href} href={item.href} aria-current={pathname === item.href ? 'page' : undefined}>
                    <Icon name={iconForPath(item.href)} size={19} /><span>{item.label}</span><span className="nav-active-dot" />
                </Link>
            ))}
        </nav>
    );
}
