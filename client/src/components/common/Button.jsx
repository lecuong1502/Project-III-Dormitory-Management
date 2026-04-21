const variants = {
    primary: { background: 'var(--primary)', color: '#fff', border: 'none' },
    danger: { background: 'var(--danger)', color: '#fff', border: 'none' },
    success: { background: 'var(--success)', color: '#fff', border: 'none' },
    outline: { background: 'transparent', color: 'var(--primary)', border: '1.5px solid var(--primary)' },
    ghost: { background: '#f3f4f6', color: 'var(--text)', border: 'none' },
};

const Button = ({ children, variant = 'primary', size = 'md', loading, disabled, style, ...props }) => {
    const v = variants[variant] || variants.primary;
    const pad = size === 'sm' ? '6px 14px' : size === 'lg' ? '12px 28px' : '9px 20px';
    const fs = size === 'sm' ? '13px' : size === 'lg' ? '16px' : '14px';

    return (
        <button
            disabled={disabled || loading}
            style={{
                ...v,
                padding: pad,
                fontSize: fs,
                fontWeight: 600,
                borderRadius: 'var(--radius)',
                cursor: disabled || loading ? 'not-allowed' : 'pointer',
                opacity: disabled || loading ? 0.6 : 1,
                transition: 'opacity .15s, transform .1s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                ...style,
            }}
            {...props}
        >
            {loading ? '⏳' : children}
        </button>
    );
};

export default Button;