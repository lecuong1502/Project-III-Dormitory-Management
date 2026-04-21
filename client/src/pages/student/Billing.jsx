import { useEffect, useState } from 'react';
import { billingService } from '../../services/billingService';
import { toast } from 'react-toastify';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import { formatCurrency, formatMonth, formatDate } from '../../utils/helpers';
import { Upload } from 'lucide-react';

const StudentBilling = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const fetch = () => {
        billingService.getMyInvoices()
            .then(r => setInvoices(r.data.data))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetch(); }, []);

    const handleSubmitProof = async () => {
        if (!file) return toast.error('Vui lòng chọn ảnh minh chứng.');
        const fd = new FormData();
        fd.append('payment_proof', file);
        setSubmitting(true);
        try {
            await billingService.submitProof(selected._id, fd);
            toast.success('Đã nộp minh chứng! Chờ Ban quản lý xác nhận.');
            setSelected(null);
            setFile(null);
            fetch();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Thất bại.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>;

    const unpaid = invoices.filter(i => i.status === 'unpaid');
    const others = invoices.filter(i => i.status !== 'unpaid');

    return (
        <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Hóa đơn của tôi</h1>

            {unpaid.length > 0 && (
                <div style={{
                    background: '#fee2e2', border: '1px solid #fca5a5',
                    borderRadius: 10, padding: '12px 16px', marginBottom: 20,
                    display: 'flex', alignItems: 'center', gap: 8, color: '#991b1b', fontSize: 14,
                }}>
                    ⚠️ Bạn có <strong>{unpaid.length}</strong> hóa đơn chưa thanh toán. Vui lòng thanh toán đúng hạn.
                </div>
            )}

            <Card title="Danh sách hóa đơn">
                {invoices.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px 0' }}>Chưa có hóa đơn nào</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead>
                            <tr style={{ background: 'var(--bg)' }}>
                                {['Tháng', 'Tiền phòng', 'Điện/Nước', 'Dịch vụ', 'Tổng tiền', 'Trạng thái', 'Thao tác'].map(h => (
                                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: 13 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map(inv => (
                                <tr key={inv._id} style={{ borderTop: '1px solid var(--border)' }}>
                                    <td style={{ padding: '12px' }}>{formatMonth(inv.month)}</td>
                                    <td style={{ padding: '12px' }}>{formatCurrency(inv.room_fee)}</td>
                                    <td style={{ padding: '12px' }}>{formatCurrency((inv.electricity_fee || 0) + (inv.water_fee || 0))}</td>
                                    <td style={{ padding: '12px' }}>{formatCurrency(inv.service_fee || 0)}</td>
                                    <td style={{ padding: '12px', fontWeight: 700 }}>{formatCurrency(inv.total_amount)}</td>
                                    <td style={{ padding: '12px' }}><StatusBadge status={inv.status} /></td>
                                    <td style={{ padding: '12px' }}>
                                        {inv.status === 'unpaid' && (
                                            <Button size="sm" onClick={() => setSelected(inv)}>
                                                <Upload size={13} /> Nộp minh chứng
                                            </Button>
                                        )}
                                        {inv.status === 'pending_verification' && (
                                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Đang chờ xác nhận</span>
                                        )}
                                        {inv.status === 'paid' && (
                                            <span style={{ fontSize: 12, color: 'var(--success)' }}>✓ Đã xác nhận {formatDate(inv.paid_at)}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Card>

            {/* Upload proof modal */}
            <Modal open={!!selected} onClose={() => { setSelected(null); setFile(null); }} title="Nộp minh chứng thanh toán">
                {selected && (
                    <div>
                        <div style={{ background: 'var(--bg)', borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 14 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ color: 'var(--text-muted)' }}>Hóa đơn tháng</span>
                                <strong>{formatMonth(selected.month)}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Tổng tiền</span>
                                <strong style={{ color: 'var(--primary)', fontSize: 16 }}>{formatCurrency(selected.total_amount)}</strong>
                            </div>
                        </div>
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                                Tải lên ảnh chụp màn hình / biên lai chuyển khoản *
                            </label>
                            <input type="file" accept="image/*,application/pdf"
                                onChange={e => setFile(e.target.files[0])}
                                style={{ width: '100%', padding: 8, border: '1.5px dashed var(--border)', borderRadius: 8 }} />
                            {file && <p style={{ fontSize: 12, color: 'var(--success)', marginTop: 6 }}>✓ Đã chọn: {file.name}</p>}
                        </div>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <Button variant="ghost" onClick={() => { setSelected(null); setFile(null); }}>Hủy</Button>
                            <Button loading={submitting} onClick={handleSubmitProof}>Xác nhận đã thanh toán</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default StudentBilling;