export default function PageHeader({ title, description, eyebrow, action }) {
    return (
        <div className="page-header">
            <div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1><p>{description}</p></div>
            {action && <div className="page-header-action">{action}</div>}
        </div>
    );
}
