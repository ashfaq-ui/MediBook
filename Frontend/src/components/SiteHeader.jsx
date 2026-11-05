'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Brand from './Brand';
import Icon from './Icon';
import { workspaceLinks } from '../lib/navigation';

export default function SiteHeader() {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);
    const workspace = /^\/(patient|doctor|admin)(\/|$)/.test(pathname);
    const auth = pathname === '/login' || pathname === '/register';
    return (
        <>
            <a className="skip-link" href="#main-content">Skip to content</a>
            {!workspace && <header className={`site-header${auth ? ' auth-site-header' : ''}`}>
                <Brand />
                {auth ? <Link className="back-home" href="/"><Icon name="arrow" size={16} />Back to home</Link> : <>
                    <button className="mobile-menu-button" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-controls="public-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><Icon name={menuOpen ? 'close' : 'menu'} /></button>
                    <div className={`public-navigation${menuOpen ? ' is-open' : ''}`} id="public-navigation">
                        <nav aria-label="Main navigation">
                            <Link href="/" aria-current={pathname === '/' ? 'page' : undefined} onClick={() => setMenuOpen(false)}>Home</Link>
                            {workspaceLinks.map(item => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label === 'Admin' ? 'For clinics' : `For ${item.label.toLowerCase()}s`}</Link>)}
                        </nav>
                        <div className="header-actions"><Link className="header-signin" href="/login" onClick={() => setMenuOpen(false)}>Sign in</Link><Link className="button primary-button small-button" href="/register" onClick={() => setMenuOpen(false)}>Get started<Icon name="arrow" size={16} /></Link></div>
                    </div>
                </>}
            </header>}
            {!workspace && !auth && <p className="preview-notice"><Icon name="info" size={14} />Book and manage your clinic appointments with MediBook.</p>}
        </>
    );
}
