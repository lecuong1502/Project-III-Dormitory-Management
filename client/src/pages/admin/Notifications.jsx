import { useEffect, useState } from 'react';
import { notificationService } from '../../services/otherServices';
import { toast } from 'react-toastify';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Spinner from '../../components/common/Spinner';
import { formatDate } from '../../utils/helpers';
import { Send, Plus } from 'lucide-react';

const AdminNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ title: '', content: '', student_id: '' });
    const [submitting, setSubmitting] = useState(false);

    const fetch = () => {
        notificationService.getAll().then(r => setNotifications(r.data.data)).finally(() => setLoading(false));
    };

    useEffect(() => { fetch(); }, []);

    const handleSend = async () => {
        if (!form.title || !form.content) return toast.error('Vui lòng nhập tiêu đề và nội dung.');
        setSubmitting(true);
        try {
            await notificationService.send({ ...form, student_id: form.student_id || undefined });
            toast.success(form.student_id ? 'Đã gửi thông báo cá nhân.' : 'Đã gửi thông báo đến tất cả sinh viên.');
            setModalOpen(false);
            setForm({ title: '', content: '', student_id: '' });
            fetch();
        } catch (err) { toast.error(err.response?.data?.message || 'Thất bại.'); }
        finally { setSubmitting(false); }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700 }}>Quản lý thông báo</h1>
                <Button onClick={() => setModalOpen(true)} style={{ display: 'flex', gap: 6 }}>
                    <Plus size={15} /> Tạo thông báo mới
                </Button>
            </div>

            <Card>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                        <tr style={{ background: 'var(--bg)' }}>
                            {['Tiêu đề', 'Nội dung', 'Đối tượng', 'Ngày gửi'].map(h => (
                                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: 13 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {notifications.length === 0 ? (
                            <tr><td colSpan={4} style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>Chưa có thông báo nào</td></tr>
                        ) : notifications.map(n => (
                            <tr key={n._id} style={{ borderTop: '1px solid var(--border)' }}>
                                <td style={{ padding: 12, fontWeight: 600 }}>{n.title}</td>
                                <td style={{ padding: 12, color: 'var(--text-muted)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.content}</td>
                                <td style={{ padding: 12 }}>
                                    {n.student_id ? (
                                        <span style={{ fontSize: 12, background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                                            {n.student_id.fullname || 'Cá nhân'}
                                        </span>
                                    ) : (
                                        <span style={{ fontSize: 12, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                                            Tất cả
                                        </span>
                                    )}
                                </td>
                                <td style={{ padding: 12, color: 'var(--text-muted)' }}>{formatDate(n.createdAt)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Tạo thông báo mới">
                <Input label="Tiêu đề *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="VD: Lịch cắt điện tháng 4" />
                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Nội dung *</label>
                    <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={4}
                        placeholder="Nội dung thông báo..."
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, resize: 'vertical' }} />
                </div>
                <Input label="ID sinh viên (để trống = gửi tất cả)" value={form.student_id}
                    onChange={e => setForm({ ...form, student_id: e.target.value })}
                    placeholder="Để trống để gửi cho tất cả sinh viên" />
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                    <Button variant="ghost" onClick={() => setModalOpen(false)}>Hủy</Button>
                    <Button loading={submitting} onClick={handleSend} style={{ display: 'flex', gap: 6 }}>
                        <Send size={14} /> Gửi thông báo
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default AdminNotifications;