import Link from 'next/link';
import PageHeader from '../components/PageHeader';

export default function NotFound() {
    return (
        <main id="main-content" className="public-page">
            <PageHeader title="Page not found" description="The page you are looking for is not available." />
            <Link href="/">Return to home</Link>
        </main>
    );
}
