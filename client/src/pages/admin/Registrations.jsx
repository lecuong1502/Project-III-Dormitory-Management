import { useEffect, useState } from 'react';
import { registrationService } from '../../services/registrationService';
import { roomService } from '../../services/roomService';
import { toast } from 'react-toastify';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import Spinner from '../../components/common/Spinner';
import { formatDate } from '../../utils/helpers';
import { Check, X } from 'lucide-react';

const AdminRegistrations = () => {
    const [regs, setRegs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [selected, setSelected] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState('');
    const [selectedBed, setSelectedBed] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const [mode, setMode] = useState(''); // 'approve' | 'reject'
    const [submitting, setSubmitting] = useState(false);

    const fetch = () => {
        registrationService.getAll({ status: filter || undefined })
            .then(r => setRegs(r.data.data)).finally(() => setLoading(false));
    };

    useEffect(() => { fetch(); }, [filter]);

    const openApprove = async (reg) => {
        setSelected(reg); setMode('approve');
        const r = await roomService.getRooms({ status: 'available' });
        setRooms(r.data.data);
    };

    const handleApprove = async () => {
        if (!selectedRoom || !selectedBed) return toast.error('Vui lòng chọn phòng và giường.');
        setSubmitting(true);
        try {
            await registrationService.approve(selected._id, { room_id: selectedRoom, bed_id: selectedBed });
            toast.success('Đã duyệt và xếp phòng thành công!');
            setSelected(null); setSelectedRoom(''); setSelectedBed('');
            fetch();
        } catch (err) { toast.error(err.response?.data?.message || 'Thất bại.'); }
        finally { setSubmitting(false); }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) return toast.error('Vui lòng nhập lý do từ chối.');
        setSubmitting(true);
        try {
            await registrationService.reject(selected._id, { rejection_reason: rejectReason });
            toast.success('Đã từ chối đơn.');
            setSelected(null); setRejectReason('');
            fetch();
        } catch (err) { toast.error(err.response?.data?.message || 'Thất bại.'); }
        finally { setSubmitting(false); }
    };

    const currentRoomData = rooms.find(r => r._id === selectedRoom);
    const availableBeds = currentRoomData?.beds?.filter(b => b.status === 'available') || [];

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>;

    return (
        <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Quản lý hồ sơ đăng ký</h1>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {[['pending', 'Chờ duyệt'], ['approved', 'Đã duyệt'], ['rejected', 'Từ chối'], ['', 'Tất cả']].map(([val, label]) => (
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
                            {['Sinh viên', 'Mã SV', 'Loại phòng', 'Ngày gửi', 'Trạng thái', 'Thao tác'].map(h => (
                                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: 13 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {regs.length === 0 ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>Không có dữ liệu</td></tr>
                        ) : regs.map(reg => (
                            <tr key={reg._id} style={{ borderTop: '1px solid var(--border)' }}>
                                <td style={{ padding: 12, fontWeight: 600 }}>{reg.student_id?.fullname}</td>
                                <td style={{ padding: 12, color: 'var(--text-muted)' }}>{reg.student_id?.student_code}</td>
                                <td style={{ padding: 12 }}>{reg.desired_room_type}</td>
                                <td style={{ padding: 12, color: 'var(--text-muted)' }}>{formatDate(reg.createdAt)}</td>
                                <td style={{ padding: 12 }}><StatusBadge status={reg.status} /></td>
                                <td style={{ padding: 12 }}>
                                    {reg.status === 'pending' && (
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <Button size="sm" variant="success" onClick={() => openApprove(reg)}>
                                                <Check size={13} /> Duyệt
                                            </Button>
                                            <Button size="sm" variant="danger" onClick={() => { setSelected(reg); setMode('reject'); }}>
                                                <X size={13} /> Từ chối
                                            </Button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            {/* Approve modal */}
            <Modal open={mode === 'approve' && !!selected} onClose={() => { setSelected(null); setMode(''); }}
                title={`Xét duyệt: ${selected?.student_id?.fullname}`} width={520}>
                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Chọn phòng *</label>
                    <select value={selectedRoom} onChange={e => { setSelectedRoom(e.target.value); setSelectedBed(''); }}
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14 }}>
                        <option value="">-- Chọn phòng --</option>
                        {rooms.map(r => (
                            <option key={r._id} value={r._id}>
                                Phòng {r.room_number} - {r.building_id?.name} ({r.available_beds_count || r.beds?.filter(b => b.status === 'available').length} chỗ trống)
                            </option>
                        ))}
                    </select>
                </div>
                {selectedRoom && (
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Chọn giường *</label>
                        <select value={selectedBed} onChange={e => setSelectedBed(e.target.value)}
                            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14 }}>
                            <option value="">-- Chọn giường --</option>
                            {availableBeds.map(b => <option key={b._id} value={b._id}>Giường {b.bed_number}</option>)}
                        </select>
                    </div>
                )}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <Button variant="ghost" onClick={() => { setSelected(null); setMode(''); }}>Hủy</Button>
                    <Button loading={submitting} onClick={handleApprove}><Check size={14} /> Xác nhận xếp phòng</Button>
                </div>
            </Modal>

            {/* Reject modal */}
            <Modal open={mode === 'reject' && !!selected} onClose={() => { setSelected(null); setMode(''); }}
                title={`Từ chối đơn: ${selected?.student_id?.fullname}`}>
                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Lý do từ chối *</label>
                    <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3}
                        placeholder="Nhập lý do từ chối..."
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <Button variant="ghost" onClick={() => { setSelected(null); setMode(''); }}>Hủy</Button>
                    <Button variant="danger" loading={submitting} onClick={handleReject}><X size={14} /> Từ chối đơn</Button>
                </div>
            </Modal>
        </div>
    );
};

export default AdminRegistrations;