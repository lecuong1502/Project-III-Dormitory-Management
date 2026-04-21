import { } from '../../utils/helpers';

const StatusBadge = ({ status }) => {
    const cfg = statusConfig[status] || { label: status, color: '#6b7280', bg: '#f3f4f6' };
    return (
        <span style={{
            display: 'inline-block',
            padding: '2px 10px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 600,
            color: cfg.color,
            background: cfg.bg,
        }}>
            {cfg.label}
        </span>
    );
};

export default StatusBadge;