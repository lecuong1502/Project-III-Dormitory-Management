import { useEffect, useState } from 'react';
import { requestService } from '../../services/otherServices';
import { toast } from 'react-toastify';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import Spinner from '../../components/common/Spinner';
import { formatDate, categoryLabels } from '../../utils/helpers';
import { roomService } from '../../services/roomService';

const AdminRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('new');
    const [selected, setSelected] = useState(null);
    const [response, setResponse] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [rooms, setRooms] = useState([]);
    const [newRoomId, setNewRoomId] = useState('');
    const [newBedId, setNewBedId] = useState('');

    const fetch = () => {
        requestService.getAll({ status: filter || undefined })
            .then(r => setRequests(r.data.data)).finally(() => setLoading(false));
    };

    useEffect(() => { fetch(); }, [filter]);

    const updateStatus = async (id, status, admin_response) => {
        setSubmitting(true);
        try {
            const body = { status, admin_response };
            if (status === 'completed' && selected?.category === 'room_transfer') {
                if (!newRoomId || !newBedId) {
                    toast.error('Vui lòng chọn phòng và giường mới.');
                    setSubmitting(false);
                    return;
                }
                body.new_room_id = newRoomId;
                body.new_bed_id = newBedId;
            }
            await requestService.updateStatus(id, body);
            toast.success(`Đã cập nhật trạng thái.`);
            setSelected(null);
            setResponse('');
            setNewRoomId('');
            setNewBedId('');
            fetch();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Thất bại.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>;

    return (
        <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Quản lý yêu cầu hỗ trợ</h1>

            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {[['new', 'Mới'], ['processing', 'Đang xử lý'], ['completed', 'Hoàn thành'], ['', 'Tất cả']].map(([val, label]) => (
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
                            {['Sinh viên', 'Loại', 'Nội dung', 'Ngày tạo', 'Trạng thái', 'Thao tác'].map(h => (
                                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', fontSize: 13 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length === 0 ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>Không có yêu cầu nào</td></tr>
                        ) : requests.map(req => (
                            <tr key={req._id} style={{ borderTop: '1px solid var(--border)' }}>
                                <td style={{ padding: 12 }}>
                                    <div style={{ fontWeight: 600 }}>{req.student_id?.fullname}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{req.student_id?.student_code}</div>
                                </td>
                                <td style={{ padding: 12 }}>{categoryLabels[req.category] || req.category}</td>
                                <td style={{ padding: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.content}</td>
                                <td style={{ padding: 12, color: 'var(--text-muted)' }}>{formatDate(req.createdAt)}</td>
                                <td style={{ padding: 12 }}><StatusBadge status={req.status} /></td>
                                <td style={{ padding: 12 }}>
                                    {req.status === 'new' && (
                                        <Button size="sm" onClick={() => updateStatus(req._id, 'processing')}>Tiếp nhận</Button>
                                    )}
                                    {req.status === 'processing' && (
                                        <Button size="sm" variant="success" onClick={async () => {
                                            setSelected(req);
                                            if (req.category === 'room_transfer') {
                                                // Load danh sách phòng trống để admin chọn
                                                const r = await roomService.getRooms({ status: 'available' });
                                                setRooms(r.data.data);
                                            }
                                        }}>Hoàn tất</Button>
                                    )}
                                    {req.status === 'completed' && (
                                        <span style={{ fontSize: 12, color: 'var(--success)' }}>✓ {formatDate(req.resolved_at)}</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            <Modal open={!!selected} onClose={() => setSelected(null)} title="Hoàn tất yêu cầu">
                {selected && (
                    <div>
                        <div style={{ background: 'var(--bg)', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 14 }}>
                            <div><strong>Sinh viên:</strong> {selected.student_id?.fullname}</div>
                            <div style={{ marginTop: 4 }}><strong>Loại yêu cầu:</strong> {categoryLabels[selected.category]}</div>
                            <div style={{ marginTop: 4 }}><strong>Nội dung:</strong> {selected.content}</div>
                        </div>

                        {/* Chọn phòng mới nếu là yêu cầu chuyển phòng */}
                        {selected.category === 'room_transfer' && (
                            <div>
                                <div style={{
                                    background: '#fef3c7', border: '1px solid #fde68a',
                                    borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 13, color: '#92400e'
                                }}>
                                    ⚠️ Yêu cầu chuyển phòng — vui lòng chọn phòng và giường mới cho sinh viên.
                                </div>
                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                                        Phòng mới *
                                    </label>
                                    <select value={newRoomId} onChange={e => { setNewRoomId(e.target.value); setNewBedId(''); }}
                                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14 }}>
                                        <option value="">-- Chọn phòng --</option>
                                        {rooms.map(r => (
                                            <option key={r._id} value={r._id}>
                                                Phòng {r.room_number} - {r.building_id?.name} ({r.beds?.filter(b => b.status === 'available').length} chỗ trống)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {newRoomId && (
                                    <div style={{ marginBottom: 14 }}>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                                            Giường mới *
                                        </label>
                                        <select value={newBedId} onChange={e => setNewBedId(e.target.value)}
                                            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14 }}>
                                            <option value="">-- Chọn giường --</option>
                                            {rooms.find(r => r._id === newRoomId)?.beds
                                                ?.filter(b => b.status === 'available')
                                                .map(b => <option key={b._id} value={b._id}>Giường {b.bed_number}</option>)
                                            }
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Cảnh báo xác nhận trả phòng */}
                        {selected.category === 'checkout' && (
                            <div style={{
                                background: '#fee2e2', border: '1px solid #fca5a5',
                                borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 13, color: '#991b1b'
                            }}>
                                ⚠️ <strong>Xác nhận trả phòng</strong> — Sau khi hoàn tất, hệ thống sẽ tự động:
                                <ul style={{ marginTop: 8, paddingLeft: 20, lineHeight: 2 }}>
                                    <li>Giải phóng giường của sinh viên → trạng thái "Trống"</li>
                                    <li>Kết thúc hợp đồng lưu trú hiện tại</li>
                                    <li>Xóa thông tin phòng khỏi tài khoản sinh viên</li>
                                </ul>
                                <p style={{ marginTop: 8, fontWeight: 600 }}>Hành động này không thể hoàn tác!</p>
                            </div>
                        )}

                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                                Phản hồi / Kết quả xử lý
                            </label>
                            <textarea value={response} onChange={e => setResponse(e.target.value)} rows={3}
                                placeholder="Mô tả kết quả xử lý..."
                                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, resize: 'vertical' }} />
                        </div>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <Button variant="ghost" onClick={() => { setSelected(null); setNewRoomId(''); setNewBedId(''); }}>Hủy</Button>
                            <Button
                                variant={selected.category === 'checkout' ? 'danger' : 'success'}
                                loading={submitting}
                                onClick={() => updateStatus(selected._id, 'completed', response)}>
                                {selected.category === 'checkout' ? '⚠️ Xác nhận trả phòng' : 'Xác nhận hoàn tất'}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminRequests;
