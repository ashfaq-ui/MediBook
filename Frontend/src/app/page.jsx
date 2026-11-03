import Link from 'next/link';
import Brand from '../components/Brand';
import Icon from '../components/Icon';
import { workspaceLinks } from '../lib/navigation';

export default function HomePage() {
    return (
        <main id="main-content" className="landing-page">
            <section className="landing-hero">
                <div className="hero-copy">
                    <span className="hero-eyebrow"><span /> A FRESH PERSPECTIVE ON CARE</span>
                    <h1>Good care.<br />Less hassle.<br /><em>More you.</em></h1>
                    <p>A simpler space for appointments, care teams, and everything in between. Because taking care of your health should feel a little easier.</p>
                    <div className="hero-actions"><Link className="button primary-button" href="/patient/book-appointment">Explore appointments<Icon name="arrow" size={18} /></Link><Link className="hero-secondary" href="/register">Find your place<Icon name="arrow-up" size={17} /></Link></div>
                    <div className="hero-assurance"><span><Icon name="shield" size={17} />Thoughtfully designed</span><span><Icon name="heart" size={17} />Centered around you</span></div>
                </div>
                <div className="hero-visual" aria-hidden="true">
                    <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /><span className="hero-big-plus">+</span>
                    <div className="floating-note"><span className="floating-note-icon"><Icon name="heart" size={20} /></span><div><strong>A little more peace of mind.</strong><small>That’s the idea.</small></div></div>
                    <div className="calendar-illustration">
                        <div className="illustration-header"><span className="illustration-logo"><Icon name="plus" size={20} /></span><span>Make time for <strong>you.</strong></span><span className="illustration-menu">···</span></div>
                        <div className="illustration-month"><strong>Your next chapter</strong><span>‹ &nbsp; ›</span></div>
                        <div className="illustration-calendar">{['M','T','W','T','F','S','S'].map((day,index)=><span className="calendar-weekday" key={`day-${index}`}>{day}</span>)}{Array.from({length:28},(_,index)=><span className={index===11 ? 'calendar-selected' : index===12 || index===13 ? 'calendar-highlight' : ''} key={index}>{index+1}</span>)}</div>
                        <div className="illustration-visit"><span><Icon name="calendar" size={20} /></span><div><strong>A moment for your wellbeing</strong><small>A little planning makes room for life.</small></div><Icon name="check" size={17} /></div>
                    </div>
                    <div className="floating-bottom"><span><Icon name="check" size={15} /></span> Less to organize. More to look forward to.</div>
                </div>
            </section>
            <section className="care-principles" aria-label="A simpler care experience">
                <div><span><Icon name="calendar" size={23} /></span><div><strong>A place for every appointment</strong><p>Keep your next steps together.</p></div></div>
                <div><span><Icon name="doctor" size={23} /></span><div><strong>A more connected care team</strong><p>Bring people and their care closer.</p></div></div>
                <div><span><Icon name="activity" size={23} /></span><div><strong>A little less everyday admin</strong><p>Make more room for what matters.</p></div></div>
            </section>
            <section className="workspace-section">
                <div className="workspace-section-heading"><div><span className="eyebrow">ONE PLACE. YOUR PERSPECTIVE.</span><h2>Care works better together.</h2></div><p>Whether you’re here for your health or helping others with theirs, there’s a space for you.</p></div>
                <div className="workspace-cards">{workspaceLinks.map((item,index)=><Link className={`workspace-card workspace-card-${index}`} key={item.href} href={item.href}><span className="workspace-card-icon"><Icon name={index===0?'user':index===1?'doctor':'building'} size={26} /></span><span className="workspace-card-kicker">FOR {item.label==='Admin'?'CLINICS':`${item.label.toUpperCase()}S`}</span><h3>{index===0?'Your health. Your space.':index===1?'More time for your patients.':'A calmer clinic workflow.'}</h3><p>{item.description}</p><span className="workspace-card-cta">Explore {item.label.toLowerCase()} workspace<Icon name="arrow" size={17} /></span></Link>)}</div>
            </section>
            <footer className="landing-footer"><Brand /><p>A calmer way to care.</p><div><Link href="/login">Sign in</Link><Link href="/register">Get started</Link></div></footer>
        </main>
    );
}
