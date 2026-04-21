import { useEffect, useState } from 'react';
import { dashboardService } from '../../services/otherServices';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, formatDate, categoryLabels } from '../../utils/helpers';
import { BedDouble, FileText, MessageSquare, CreditCard, Users, AlertCircle } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
    <div style={{
        background: '#fff', borderRadius: 12, padding: 22,
        border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color={color} />
            </div>
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>{value}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color, marginTop: 4 }}>{sub}</div>}
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        dashboardService.getStats().then(r => setStats(r.data.data)).finally(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>;

    return (
        <div>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700 }}>Dashboard</h1>
                <p style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: 14 }}>Tổng quan hệ thống Ký túc xá HUST</p>
            </div>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
                <StatCard icon={Users} label="Sinh viên đang lưu trú" value={stats?.total_active_residents ?? 0} color="#2563eb" />
                <StatCard icon={BedDouble} label="Giường còn trống" value={stats?.total_available_beds ?? 0} color="#16a34a" />
                <StatCard icon={FileText} label="Đơn chờ duyệt" value={stats?.pending_registrations ?? 0} color="#d97706" />
                <StatCard icon={MessageSquare} label="Yêu cầu mới" value={stats?.new_requests ?? 0} color="#7c3aed" />
                <StatCard icon={CreditCard} label="Hóa đơn chờ xác nhận" value={stats?.pending_verification_invoices ?? 0} color="#db2777" />
                <StatCard icon={AlertCircle} label="Tổng công nợ"
                    value={formatCurrency(stats?.total_unpaid_debt ?? 0)}
                    color="#dc2626"
                    sub={stats?.total_unpaid_debt > 0 ? 'Cần thu' : 'Tốt'} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Recent registrations */}
                <Card title="Đơn đăng ký mới nhất">
                    {!stats?.recent_registrations?.length ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>Không có đơn nào đang chờ</p>
                    ) : stats.recent_registrations.map(reg => (
                        <div key={reg._id} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '10px 0', borderBottom: '1px solid var(--border)',
                        }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 14 }}>{reg.student_id?.fullname}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                    {reg.student_id?.student_code} · {reg.desired_room_type} · {formatDate(reg.createdAt)}
                                </div>
                            </div>
                            <StatusBadge status={reg.status} />
                        </div>
                    ))}
                </Card>

                {/* Recent requests */}
                <Card title="Yêu cầu hỗ trợ mới nhất">
                    {!stats?.recent_requests?.length ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>Không có yêu cầu mới</p>
                    ) : stats.recent_requests.map(req => (
                        <div key={req._id} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '10px 0', borderBottom: '1px solid var(--border)',
                        }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 14 }}>{categoryLabels[req.category] || req.category}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                    {req.student_id?.fullname} · {formatDate(req.createdAt)}
                                </div>
                            </div>
                            <StatusBadge status={req.status} />
                        </div>
                    ))}
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;