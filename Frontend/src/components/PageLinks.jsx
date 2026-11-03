import Link from 'next/link';
import Icon from './Icon';
import { iconForPath } from '../lib/navigation';

export default function PageLinks({ items }) {
    return (
        <div className="page-links">
            {items.map((item, index) => (
                <Link className="page-link" key={item.href} href={item.href}>
                    <div className="page-link-top"><span className={`page-link-icon stat-color-${index % 4}`}><Icon name={iconForPath(item.href)} size={22} /></span><Icon name="arrow-up" size={19} /></div>
                    <h2>{item.label}</h2><p>{item.description}</p>
                    <span className="page-link-label">Explore<Icon name="arrow" size={15} /></span>
                </Link>
            ))}
        </div>
    );
}
