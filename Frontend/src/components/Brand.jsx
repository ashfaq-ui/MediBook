import Link from 'next/link';
import Icon from './Icon';

export default function Brand({ light = false }) {
    return (
        <Link className={`site-brand${light ? ' brand-light' : ''}`} href="/" aria-label="MediBook home">
            <span className="brand-mark"><Icon name="plus" size={25} /></span>
            <span>Medi<span className="brand-accent">Book</span><span className="brand-period">.</span></span>
        </Link>
    );
}
