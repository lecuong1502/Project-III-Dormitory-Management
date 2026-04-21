import { useEffect, useState } from 'react';
import { requestService } from '../../services/otherServices';
import { toast } from 'react-toastify';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import Spinner from '../../components/common/Spinner';
import { formatDate, categoryLabels } from '../../utils/helpers';
import { Plus } from 'lucide-react';

const StudentRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ category: 'maintenance', content: '' });
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const fetch = () => {
        requestService.getMy().then(r => setRequests(r.data.data)).finally(() => setLoading(false));
    };

    useEffect(() => { fetch(); }, []);

    const handleSubmit = async () => {
        if (!form.content.trim()) return toast.error('Vui lòng nhập nội dung yêu cầu.');
        const fd = new FormData();
        fd.append('category', form.category);
        fd.append('content', form.content);
        if (file) fd.append('attachment', file);
        setSubmitting(true);
        try {
            await requestService.create(fd);
            toast.success('Đã gửi yêu cầu hỗ trợ!');
            setModalOpen(false);
            setForm({ category: 'maintenance', content: '' });
            setFile(null);
            fetch();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gửi yêu cầu thất bại.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700 }}>Yêu cầu hỗ trợ</h1>
                <Button onClick={() => setModalOpen(true)} style={{ display: 'flex', gap: 6 }}>
                    <Plus size={15} /> Tạo yêu cầu mới
                </Button>
            </div>

            <Card>
                {requests.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px 0' }}>Bạn chưa có yêu cầu nào</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead>
                            <tr style={{ background: 'var(--bg)' }}>
                                {['Loại yêu cầu', 'Nội dung', 'Ngày tạo', 'Trạng thái', 'Phản hồi'].map(h => (
                                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: 13 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(req => (
                                <tr key={req._id} style={{ borderTop: '1px solid var(--border)' }}>
                                    <td style={{ padding: 12, fontWeight: 600 }}>{categoryLabels[req.category] || req.category}</td>
                                    <td style={{ padding: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.content}</td>
                                    <td style={{ padding: 12, color: 'var(--text-muted)' }}>{formatDate(req.createdAt)}</td>
                                    <td style={{ padding: 12 }}><StatusBadge status={req.status} /></td>
                                    <td style={{ padding: 12, color: 'var(--text-muted)', fontSize: 13 }}>{req.admin_response || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Card>

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Tạo yêu cầu hỗ trợ mới">
                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Loại yêu cầu *</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14 }}>
                        {Object.entries(categoryLabels).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                        ))}
                    </select>
                </div>
                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Nội dung chi tiết *</label>
                    <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                        rows={4} placeholder="Mô tả chi tiết vấn đề..."
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, resize: 'vertical' }} />
                </div>
                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Đính kèm ảnh (nếu có)</label>
                    <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])}
                        style={{ width: '100%', padding: 8, border: '1.5px dashed var(--border)', borderRadius: 8 }} />
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <Button variant="ghost" onClick={() => setModalOpen(false)}>Hủy</Button>
                    <Button loading={submitting} onClick={handleSubmit}>Gửi yêu cầu</Button>
                </div>
            </Modal>
        </div>
    );
};

export default StudentRequests;
