import { useEffect, useState } from 'react';
import { registrationService } from '../../services/registrationService';
import { toast } from 'react-toastify';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import Spinner from '../../components/common/Spinner';
import { formatDate } from '../../utils/helpers';
import { FileText } from 'lucide-react';

const StudentRegistration = () => {
    const [registration, setRegistration] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ desired_room_type: '4-person', desired_building: '', content: '' });

    const fetchMyReg = () => {
        registrationService.getMy()
            .then(r => setRegistration(r.data.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchMyReg(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await registrationService.submit(form);
            toast.success('Đã gửi đơn đăng ký! Vui lòng chờ xét duyệt.');
            fetchMyReg();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gửi đơn thất bại.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>;

    return (
        <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Đăng ký nội trú</h1>

            {/* Existing registration status */}
            {registration && (
                <Card title="Đơn đăng ký hiện tại" style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                            { label: 'Trạng thái', value: <StatusBadge status={registration.status} /> },
                            { label: 'Loại phòng nguyện vọng', value: registration.desired_room_type },
                            { label: 'Tòa nhà nguyện vọng', value: registration.desired_building || '—' },
                            { label: 'Ngày gửi', value: formatDate(registration.createdAt) },
                            { label: 'Ngày xét duyệt', value: formatDate(registration.reviewed_at) },
                            { label: 'Phòng được phân bổ', value: registration.assigned_room_id?.room_number || '—' },
                        ].map(({ label, value }) => (
                            <div key={label} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                borderBottom: '1px solid var(--border)', paddingBottom: 10,
                            }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{label}</span>
                                <span style={{ fontWeight: 600, fontSize: 14 }}>{value}</span>
                            </div>
                        ))}
                        {registration.rejection_reason && (
                            <div style={{
                                background: '#fee2e2', borderRadius: 8, padding: 12,
                                color: '#dc2626', fontSize: 14,
                            }}>
                                <strong>Lý do từ chối:</strong> {registration.rejection_reason}
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {/* Submit new form if no pending registration */}
            {(!registration || registration.status === 'rejected') && (
                <Card title="Gửi đơn đăng ký mới">
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                                Loại phòng nguyện vọng *
                            </label>
                            <select value={form.desired_room_type}
                                onChange={e => setForm({ ...form, desired_room_type: e.target.value })}
                                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14 }}>
                                <option value="4-person">Phòng 4 người</option>
                                <option value="6-person">Phòng 6 người</option>
                                <option value="8-person">Phòng 8 người</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Tòa nhà nguyện vọng</label>
                            <input value={form.desired_building}
                                onChange={e => setForm({ ...form, desired_building: e.target.value })}
                                placeholder="VD: Tòa A1, Tòa B2..."
                                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14 }} />
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Ghi chú thêm</label>
                            <textarea value={form.content}
                                onChange={e => setForm({ ...form, content: e.target.value })}
                                rows={4} placeholder="Thông tin thêm hoặc yêu cầu đặc biệt..."
                                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, resize: 'vertical' }} />
                        </div>

                        <Button type="submit" loading={submitting} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <FileText size={15} /> Gửi đơn đăng ký
                        </Button>
                    </form>
                </Card>
            )}

            {registration?.status === 'pending' && (
                <Card style={{ background: '#fef3c7', border: '1px solid #fde68a' }}>
                    <p style={{ color: '#92400e', fontSize: 14 }}>
                        ⏳ Đơn của bạn đang được xem xét. Bạn sẽ nhận được thông báo khi có kết quả.
                    </p>
                </Card>
            )}
        </div>
    );
};

export default StudentRegistration;