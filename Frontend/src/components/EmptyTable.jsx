import Icon from './Icon';

export default function EmptyTable({ caption, columns, message }) {
    return (
        <div className="table-container">
            <div className="table-title"><div><span className="table-title-icon"><Icon name="document" size={19} /></span><h2>{caption}</h2></div><span className="subtle-badge">Preview</span></div>
            <div className="table-scroll"><table>
                <caption className="sr-only">{caption}</caption>
                <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
                <tbody><tr><td className="empty-message" colSpan={columns.length}><span className="empty-table-icon"><Icon name="document" size={28} /></span><strong>A little space for what’s next.</strong><p>{message}</p></td></tr></tbody>
            </table></div>
        </div>
    );
}
