const Input = ({ label, error, style, ...props }) => (
    <div style={{ marginBottom: 16, ...style }}>
        {label && (
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>
                {label}
            </label>
        )}
        <input
            style={{
                width: '100%',
                padding: '9px 12px',
                border: `1.5px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
                background: '#fff',
                transition: 'border-color .15s',
            }}
            {...props}
        />
        {error && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{error}</p>}
    </div>
);

export default Input;