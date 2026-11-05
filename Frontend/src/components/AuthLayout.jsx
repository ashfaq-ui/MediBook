import Icon from './Icon';
import PageHeader from './PageHeader';

export default function AuthLayout({ title, description, children }) {
    return (
        <main id="main-content" className="auth-layout">
            <aside className="auth-story">
                <div className="auth-story-content">
                    <span className="eyebrow light-eyebrow"><span /> A LITTLE LESS COMPLICATED</span>
                    <h2>Better care.<br />A simpler<br /><em>everyday.</em></h2>
                    <p>Your appointments, your care team, and your next steps. All with a little more peace of mind.</p>
                    <div className="auth-benefits">
                        <span><Icon name="calendar" />Appointments in one place</span>
                        <span><Icon name="heart" />Care centered around you</span>
                        <span><Icon name="shield" />Thoughtfully designed for your clinic</span>
                    </div>
                </div>
                <div className="auth-story-footer"><span className="mini-cross">+</span> A little organization. A lot more peace of mind.</div>
            </aside>
            <section className="auth-form-section">
                <div className="auth-form-content">
                    <span className="eyebrow">YOUR CARE STARTS HERE</span>
                    <PageHeader title={title} description={description} />
                    {children}
                    <p className="auth-preview"><Icon name="info" size={15} /> Your account keeps your appointments in one place.</p>
                </div>
            </section>
        </main>
    );
}
