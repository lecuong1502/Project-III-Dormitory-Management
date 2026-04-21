const Card = ({ children, style, title, action }) => (
    <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        ...style,
    }}>
        {title && (
            <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{title}</h3>
                {action}
            </div>
        )}
        <div style={{ padding: 20 }}>{children}</div>
    </div>
);

export default Card;