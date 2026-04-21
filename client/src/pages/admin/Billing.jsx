import { useEffect, useState } from 'react';
import { billingService } from '../../services/billingService';
import { toast } from 'react-toastify';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import Spinner from '../../components/common/Spinner';
import { formatCurrency, formatMonth, formatDate } from '../../utils/helpers';
import { Plus, Check, X, Eye } from 'lucide-react';

const AdminBilling = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [generateModal, setGenerateModal] = useState(false);
    const [month, setMonth] = useState('');
    const [generating, setGenerating] = useState(false);
    const [selected, setSelected] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetch = () => {
        billingService.getAllInvoices({ status: filter || undefined })
            .then(r => setInvoices(r.data.data)).finally(() => setLoading(false));
    };

    useEffect(() => { fetch(); }, [filter]);

    const handleGenerate = async () => {
        if (!month) return toast.error('Vui lòng chọn tháng.');
        setGenerating(true);
        try {
            const res = await billingService.generateInvoices({ month });
            toast.success(`Đã tạo ${res.data.data.count} hóa đơn cho tháng ${month}.`);
            setGenerateModal(false); setMonth('');
            fetch();
        } catch (err) { toast.error(err.response?.data?.message || 'Thất bại.'); }
        finally { setGenerating(false); }
    };

    const handleConfirm = async (id) => {
        try {
            await billingService.confirmPayment(id);
            toast.success('Đã xác nhận thanh toán.');
            fetch();
        } catch (err) { toast.error(err.response?.data?.message || 'Thất bại.'); }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) return toast.error('Vui lòng nhập lý do.');
        setSubmitting(true);
        try {
            await billingService.rejectPayment(selected._id, { rejection_reason: rejectReason });
            toast.success('Đã từ chối xác nhận.');
            setSelected(null); setRejectReason('');
            fetch();
        } catch (err) { toast.error(err.response?.data?.message || 'Thất bại.'); }
        finally { setSubmitting(false); }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700 }}>Quản lý tài chính</h1>
                <Button onClick={() => setGenerateModal(true)} style={{ display: 'flex', gap: 6 }}>
                    <Plus size={15} /> Tạo hóa đơn tháng
                </Button>
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {[['', 'Tất cả'], ['unpaid', 'Chưa TT'], ['pending_verification', 'Chờ xác nhận'], ['paid', 'Đã TT']].map(([val, label]) => (
                    <button key={val} onClick={() => setFilter(val)} style={{
                        padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        border: '1.5px solid', borderColor: filter === val ? 'var(--primary)' : 'var(--border)',
                        background: filter === val ? 'var(--primary)' : '#fff',
                        color: filter === val ? '#fff' : 'var(--text-muted)',
                    }}>{label}</button>
                ))}
            </div>

            <Card>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                        <tr style={{ background: 'var(--bg)' }}>
                            {['Sinh viên', 'Tháng', 'Phòng', 'Tổng tiền', 'Trạng thái', 'Minh chứng', 'Thao tác'].map(h => (
                                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: 13 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.length === 0 ? (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>Không có dữ liệu</td></tr>
                        ) : invoices.map(inv => (
                            <tr key={inv._id} style={{ borderTop: '1px solid var(--border)' }}>
                                <td style={{ padding: 12 }}>
                                    <div style={{ fontWeight: 600 }}>{inv.student_id?.fullname}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{inv.student_id?.student_code}</div>
                                </td>
                                <td style={{ padding: 12 }}>{formatMonth(inv.month)}</td>
                                <td style={{ padding: 12, color: 'var(--text-muted)' }}>{inv.room_id?.room_number || '—'}</td>
                                <td style={{ padding: 12, fontWeight: 700 }}>{formatCurrency(inv.total_amount)}</td>
                                <td style={{ padding: 12 }}><StatusBadge status={inv.status} /></td>
                                <td style={{ padding: 12 }}>
                                    {inv.payment_proof_url ? (
                                        <a href={`http://localhost:5000${inv.payment_proof_url}`} target="_blank" rel="noreferrer"
                                            style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 600 }}>
                                            <Eye size={13} style={{ verticalAlign: 'middle' }} /> Xem
                                        </a>
                                    ) : '—'}
                                </td>
                                <td style={{ padding: 12 }}>
                                    {inv.status === 'pending_verification' && (
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <Button size="sm" variant="success" onClick={() => handleConfirm(inv._id)}>
                                                <Check size={13} /> Xác nhận
                                            </Button>
                                            <Button size="sm" variant="danger" onClick={() => setSelected(inv)}>
                                                <X size={13} /> Từ chối
                                            </Button>
                                        </div>
                                    )}
                                    {inv.status === 'paid' && (
                                        <span style={{ fontSize: 12, color: 'var(--success)' }}>✓ {formatDate(inv.paid_at)}</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            {/* Generate modal */}
            <Modal open={generateModal} onClose={() => setGenerateModal(false)} title="Tạo hóa đơn tháng">
                <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>
                    Hệ thống sẽ tự động tạo hóa đơn cho tất cả sinh viên đang lưu trú trong tháng được chọn.
                </p>
                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Chọn tháng *</label>
                    <input type="month" value={month} onChange={e => setMonth(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14 }} />
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <Button variant="ghost" onClick={() => setGenerateModal(false)}>Hủy</Button>
                    <Button loading={generating} onClick={handleGenerate}><Plus size={14} /> Tạo hóa đơn</Button>
                </div>
            </Modal>

            {/* Reject modal */}
            <Modal open={!!selected} onClose={() => setSelected(null)} title="Từ chối minh chứng thanh toán">
                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Lý do từ chối *</label>
                    <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3}
                        placeholder="VD: Chuyển khoản thiếu tiền, sai nội dung..."
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <Button variant="ghost" onClick={() => setSelected(null)}>Hủy</Button>
                    <Button variant="danger" loading={submitting} onClick={handleReject}><X size={14} /> Từ chối</Button>
                </div>
            </Modal>
        </div>
    );
};

export default AdminBilling;