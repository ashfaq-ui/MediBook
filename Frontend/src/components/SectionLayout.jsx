import Link from 'next/link';
import Brand from './Brand';
import Icon from './Icon';
import SectionNavigation from './SectionNavigation';
import WorkspaceBar from './WorkspaceBar';

export default function SectionLayout({ title, items, children }) {
    return (
        <div className="section-layout">
            <aside className="workspace-sidebar">
                <div className="sidebar-brand"><Brand /></div>
                <SectionNavigation title={title} items={items} />
                <div className="sidebar-bottom">
                    <div className="sidebar-note"><Icon name="heart" size={22} /><strong>A little more peace of mind.</strong><p>Care feels better when everything has its place.</p></div>
                    <Link className="sidebar-signin" href="/login"><span className="role-avatar">{title.charAt(0)}</span><span><strong>{title} workspace</strong><small>Sign in to your account</small></span><Icon name="login" size={18} /></Link>
                </div>
            </aside>
            <div className="workspace-body">
                <WorkspaceBar title={title} items={items} />
                <main id="main-content" className="page-content">{children}</main>
                <footer className="workspace-footer">A little less complicated. A little more MediBook.</footer>
            </div>
        </div>
    );
}
