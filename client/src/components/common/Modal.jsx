import { useEffect } from 'react';

const Modal = ({ open, onClose, title, children, width = 480 }) => {
    useEffect(() => {
        if (open) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    if (!open) return null;

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'rgba(0,0,0,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 16,
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'var(--bg-card)',
                    borderRadius: 14,
                    width: '100%',
                    maxWidth: width,
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                }}
            >
                <div style={{
                    padding: '18px 24px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>{title}</h3>
                    <button onClick={onClose} style={{
                        background: 'none', border: 'none', fontSize: 20,
                        cursor: 'pointer', color: 'var(--text-muted)', lineHeight: 1,
                    }}>x</button>
                </div>
                <div style={{ padding: 24 }}>{children}</div>
            </div>
        </div>
    );
};

export default Modal;