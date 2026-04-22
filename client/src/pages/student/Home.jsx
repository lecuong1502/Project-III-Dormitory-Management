import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { billingService } from '../../services/billingService';
import { requestService } from '../../services/otherServices';
import { notificationService } from '../../services/otherServices';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, formatMonth } from '../../utils/helpers';
import { CreditCard, MessageSquare, Bell, Building2, AlertCircle } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color, onClick }) => (
    <div onClick={onClick} style={{
        background: '#fff', borderRadius: 12, padding: 20,
        border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex', alignItems: 'center', gap: 16,
        transition: 'transform .15s',
    }}
        onMouseEnter={e => onClick && (e.currentTarget.style.transform = 'translateY(-2px)')}
        onMouseLeave={e => onClick && (e.currentTarget.style.transform = 'translateY(0)')}
    >
        <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <Icon size={22} color={color} />
        </div>
        <div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{value}</div>
        </div>
    </div>
);

const StudentHome = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [requests, setRequests] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const student = user?.student;

    useEffect(() => {
        billingService.getMyInvoices().then(r => setInvoices(r.data.data)).catch(() => { });
        requestService.getMy().then(r => setRequests(r.data.data)).catch(() => { });
        notificationService.getMy().then(r => setNotifications(r.data.data)).catch(() => { });
    }, []);

    const unpaidCount = invoices.filter(i => i.status === 'unpaid').length;
    const newRequestCount = requests.filter(r => r.status === 'new' || r.status === 'processing').length;
    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700 }}>
                    Xin chào, {student?.fullname || 'Sinh viên'} 👋
                </h1>
                <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>
                    {student?.student_code} · Hệ thống Quản lý Ký túc xá HUST
                </p>
            </div>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
                <StatCard icon={CreditCard} label="Hóa đơn chưa thanh toán" value={unpaidCount}
                    color="#dc2626" onClick={() => navigate('/student/billing')} />
                <StatCard icon={MessageSquare} label="Yêu cầu đang xử lý" value={newRequestCount}
                    color="#d97706" onClick={() => navigate('/student/requests')} />
                <StatCard icon={Bell} label="Thông báo chưa đọc" value={unreadCount}
                    color="#2563eb" onClick={() => navigate('/student/notifications')} />
                <StatCard icon={Building2} label="Trạng thái phòng"
                    value={student?.current_contract ? 'Đang ở' : 'Chưa có phòng'}
                    color="#16a34a" onClick={() => navigate('/student/room')} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Recent invoices */}
                <Card title="Hóa đơn gần đây">
                    {invoices.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>Chưa có hóa đơn</p>
                    ) : invoices.slice(0, 4).map(inv => (
                        <div key={inv._id} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '10px 0', borderBottom: '1px solid var(--border)',
                        }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 14 }}>{formatMonth(inv.month)}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatCurrency(inv.total_amount)}</div>
                            </div>
                            <StatusBadge status={inv.status} />
                        </div>
                    ))}
                </Card>

                {/* Recent notifications */}
                <Card title="Thông báo mới nhất">
                    {notifications.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>Không có thông báo</p>
                    ) : notifications.slice(0, 4).map(n => (
                        <div key={n._id} style={{
                            padding: '10px 0', borderBottom: '1px solid var(--border)',
                            display: 'flex', gap: 10,
                        }}>
                            {!n.is_read && (
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', marginTop: 6, flexShrink: 0 }} />
                            )}
                            <div>
                                <div style={{ fontWeight: n.is_read ? 400 : 700, fontSize: 14 }}>{n.title}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                    {n.content.length > 60 ? n.content.slice(0, 60) + '...' : n.content}
                                 </div>
                            </div>
                        </div>
                    ))}
                </Card>
            </div>
        </div>
    );
};

export default StudentHome;