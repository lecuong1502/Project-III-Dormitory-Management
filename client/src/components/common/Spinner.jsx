const Spinner = ({ size = 32, fullPage }) => {
    const spinner = (
        <div style={{
            width: size, height: size,
            border: `3px solid var(--border)`,
            borderTop: `3px solid var(--primary)`,
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
        }} />
    );

    if (fullPage) return (
        <div style={{
            position: 'fixed', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.8)', zIndex: 999,
        }}>
            {spinner}
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    );

    return (
        <>
            {spinner}
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </>
    );
};

export default Spinner;