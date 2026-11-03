import './globals.css';
import SiteHeader from '../components/SiteHeader';

export const metadata = {
    title: { default: 'MediBook', template: '%s | MediBook' },
    description: 'Clinic appointments, made simple.',
    icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body><SiteHeader />{children}</body>
        </html>
    );
}
