import Link from 'next/link';
import Icon from './Icon';
import PageHeader from './PageHeader';
import PageLinks from './PageLinks';
import { navigation, iconForPath } from '../lib/navigation';

const content = {
    patient: {
        title: 'Your care, at a glance.', description: 'A little more clarity for your next step in care.',
        action: 'Book an appointment', href: '/patient/book-appointment',
        stats: [['Upcoming visits', 'calendar'], ['Completed visits', 'check'], ['Your care team', 'doctor'], ['Health conversations', 'sparkles']],
        panelTitle: 'Upcoming appointments', emptyTitle: 'Your next visit starts here',
        emptyDescription: 'When booking opens, your upcoming appointments will be organized right here.',
        noteTitle: 'A little preparation goes a long way.', note: 'Keep your questions and appointment details together for a calmer clinic visit.',
    },
    doctor: {
        title: 'More time for better care.', description: 'A clear space for your schedule, your patients, and your day.',
        action: 'Manage availability', href: '/doctor/slots',
        stats: [['Appointments', 'calendar'], ['Pending visits', 'clock'], ['Completed visits', 'check'], ['Available slots', 'doctor']],
        panelTitle: 'Patient appointments', emptyTitle: 'A clearer view of your day',
        emptyDescription: 'Your patient appointments will appear here when appointment management opens.',
        noteTitle: 'Make room for your best work.', note: 'Organize your availability so your schedule works for you and your patients.',
    },
    admin: {
        title: 'A healthier clinic workflow.', description: 'Bring your people, departments, and appointments together.',
        action: 'Manage departments', href: '/admin/departments',
        stats: [['Clinic users', 'users'], ['Doctor profiles', 'doctor'], ['Departments', 'building'], ['Appointments', 'calendar']],
        panelTitle: 'Clinic appointments', emptyTitle: 'Everything in its place',
        emptyDescription: 'Appointments across your clinic will appear here when management opens.',
        noteTitle: 'Good care starts with a connected team.', note: 'Keep department details and doctor profiles organized as your clinic grows.',
    },
};

export default function DashboardOverview({ role }) {
    const data = content[role];
    const links = navigation[role].slice(1);
    return (
        <div className="dashboard-overview">
            <PageHeader eyebrow={`${role.toUpperCase()} WORKSPACE`} title={data.title} description={data.description}
                action={<Link className="button primary-button" href={data.href}><Icon name="plus" size={17} />{data.action}</Link>} />
            <div className="stats-grid">
                {data.stats.map(([label, icon], index) => (
                    <section className="stat-card" key={label}>
                        <span className={`stat-icon stat-color-${index}`}><Icon name={icon} size={21} /></span>
                        <p>{label}</p><strong aria-label="Not available">—</strong>
                        <span className="stat-caption">Ready when your workspace opens</span>
                    </section>
                ))}
            </div>
            <div className="dashboard-columns">
                <section className="dashboard-panel appointment-panel">
                    <div className="panel-heading"><div><h2>{data.panelTitle}</h2><p>All the details, in one place.</p></div><Link href={links[0].href}>View all <Icon name="arrow" size={15} /></Link></div>
                    <div className="dashboard-empty">
                        <div className="empty-calendar"><Icon name="calendar" size={34} /><span><Icon name="plus" size={14} /></span></div>
                        <h3>{data.emptyTitle}</h3><p>{data.emptyDescription}</p>
                        <Link className="button secondary-button" href={data.href}>{data.action}<Icon name="arrow" size={16} /></Link>
                    </div>
                    <div className="panel-footnote"><Icon name="info" size={15} /> Preview workspace · live records are not displayed yet</div>
                </section>
                <div className="dashboard-side">
                    <section className="dashboard-panel quick-actions"><div className="panel-heading"><h2>Quick access</h2><Icon name="arrow-up" size={18} /></div>
                        {links.map(item => <Link key={item.href} href={item.href}><span className="quick-action-icon"><Icon name={iconForPath(item.href)} /></span><span><strong>{item.label}</strong><small>{item.description}</small></span><Icon name="arrow" size={16} /></Link>)}
                    </section>
                    <section className="care-note"><span className="care-note-icon"><Icon name="heart" size={22} /></span><h3>{data.noteTitle}</h3><p>{data.note}</p><span className="care-note-cross">+</span></section>
                </div>
            </div>
            <section className="dashboard-explore"><div className="section-heading"><h2>Made for your everyday</h2><p>A few simple ways to stay organized.</p></div><PageLinks items={links} /></section>
        </div>
    );
}
