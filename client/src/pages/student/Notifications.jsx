import { useEffect, useState } from 'react';
import { notificationService } from '../../services/otherServices';
import { toast } from 'react-toastify';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { formatDate } from '../../utils/helpers';
import { Bell } from 'lucide-react';

const StudentNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetch = () => {
        notificationService.getMy().then(r => setNotifications(r.data.data)).finally(() => setLoading(false));
    };

    useEffect(() => { fetch(); }, []);

    const markRead = async (id) => {
        await notificationService.markRead(id);
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, is_read: true } : n));
    };

    const markAllRead = async () => {
        await notificationService.markAllRead();
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        toast.success('Đã đánh dấu tất cả là đã đọc.');
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>;

    const unread = notifications.filter(n => !n.is_read).length;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700 }}>Thông báo</h1>
                    {unread > 0 && <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>{unread} thông báo chưa đọc</p>}
                </div>
                {unread > 0 && <Button variant="outline" size="sm" onClick={markAllRead}>Đánh dấu tất cả đã đọc</Button>}
            </div>

            <Card>
                {notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                        <Bell size={40} style={{ marginBottom: 10, opacity: 0.3 }} />
                        <p>Bạn chưa có thông báo nào</p>
                    </div>
                ) : notifications.map(n => (
                    <div key={n._id}
                        onClick={() => !n.is_read && markRead(n._id)}
                        style={{
                            padding: '14px 16px',
                            borderBottom: '1px solid var(--border)',
                            cursor: n.is_read ? 'default' : 'pointer',
                            background: n.is_read ? 'transparent' : 'var(--primary-light)',
                            borderRadius: 8, marginBottom: 4,
                            display: 'flex', gap: 14, alignItems: 'flex-start',
                            transition: 'background .15s',
                        }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: n.is_read ? '#f3f4f6' : 'var(--primary-light)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            <Bell size={16} color={n.is_read ? 'var(--text-muted)' : 'var(--primary)'} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                <span style={{ fontWeight: n.is_read ? 500 : 700, fontSize: 14 }}>{n.title}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(n.createdAt)}</span>
                                    {!n.is_read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />}
                                </div>
                            </div>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{n.content}</p>
                            {!n.student_id && (
                                <span style={{ fontSize: 11, color: 'var(--text-muted)', background: '#f3f4f6', padding: '2px 8px', borderRadius: 20, marginTop: 4, display: 'inline-block' }}>
                                    Thông báo chung
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </Card>
        </div>
    );
};

export default StudentNotifications;