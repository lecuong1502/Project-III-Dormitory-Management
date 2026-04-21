import { useEffect, useState } from 'react';
import { roomService } from '../../services/roomService';
import { toast } from 'react-toastify';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import Spinner from '../../components/common/Spinner';
import { Plus, Eye } from 'lucide-react';

const bedColor = { available: '#16a34a', occupied: '#2563eb', maintenance: '#6b7280' };

const AdminRooms = () => {
    const [buildings, setBuildings] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeBuilding, setActiveBuilding] = useState(null);
    const [detailRoom, setDetailRoom] = useState(null);
    const [addRoomModal, setAddRoomModal] = useState(false);
    const [form, setForm] = useState({ room_number: '', building_id: '', room_type: '4-person', price_per_month: 400000 });
    const [submitting, setSubmitting] = useState(false);

    const fetchAll = async () => {
        const [b, r] = await Promise.all([roomService.getBuildings(), roomService.getRooms()]);
        setBuildings(b.data.data);
        setRooms(r.data.data);
        if (!activeBuilding && b.data.data.length > 0) setActiveBuilding(b.data.data[0]._id);
        setLoading(false);
    };

    useEffect(() => { fetchAll(); }, []);

    const filteredRooms = rooms.filter(r => r.building_id?._id === activeBuilding || r.building_id === activeBuilding);

    const handleAddRoom = async () => {
        if (!form.room_number || !form.building_id) return toast.error('Vui lòng nhập đầy đủ thông tin.');
        setSubmitting(true);
        try {
            await roomService.createRoom(form);
            toast.success('Đã thêm phòng mới!');
            setAddRoomModal(false);
            setForm({ room_number: '', building_id: '', room_type: '4-person', price_per_month: 400000 });
            fetchAll();
        } catch (err) { toast.error(err.response?.data?.message || 'Thất bại.'); }
        finally { setSubmitting(false); }
    };

    const handleBedStatus = async (roomId, bedId, status) => {
        try {
            await roomService.updateBedStatus(roomId, bedId, { status });
            toast.success('Cập nhật trạng thái giường thành công.');
            const updated = await roomService.getRoomById(roomId);
            setDetailRoom(updated.data.data);
            fetchAll();
        } catch (err) { toast.error(err.response?.data?.message || 'Thất bại.'); }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700 }}>Sơ đồ phòng</h1>
                <Button onClick={() => setAddRoomModal(true)} style={{ display: 'flex', gap: 6 }}>
                    <Plus size={15} /> Thêm phòng mới
                </Button>
            </div>

            {/* Building tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {buildings.map(b => (
                    <button key={b._id} onClick={() => setActiveBuilding(b._id)} style={{
                        padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        border: '1.5px solid', borderColor: activeBuilding === b._id ? 'var(--primary)' : 'var(--border)',
                        background: activeBuilding === b._id ? 'var(--primary)' : '#fff',
                        color: activeBuilding === b._id ? '#fff' : 'var(--text-muted)',
                    }}>{b.name}</button>
                ))}
            </div>

            {/* Room grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
                {filteredRooms.map(room => {
                    const available = room.beds?.filter(b => b.status === 'available').length || 0;
                    const total = room.beds?.length || 0;
                    const isFull = available === 0;
                    return (
                        <div key={room._id} style={{
                            background: '#fff', borderRadius: 12, padding: 16,
                            border: `2px solid ${isFull ? '#fca5a5' : '#bbf7d0'}`,
                            boxShadow: 'var(--shadow)', cursor: 'pointer',
                            transition: 'transform .15s',
                        }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            onClick={() => roomService.getRoomById(room._id).then(r => setDetailRoom(r.data.data))}
                        >
                            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Phòng {room.room_number}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>{room.room_type}</div>
                            {/* Bed dots */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                                {room.beds?.map(b => (
                                    <div key={b._id} style={{
                                        width: 12, height: 12, borderRadius: '50%',
                                        background: bedColor[b.status] || '#ccc',
                                        title: b.status,
                                    }} />
                                ))}
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: isFull ? '#dc2626' : '#16a34a' }}>
                                {available}/{total} chỗ trống
                            </div>
                        </div>
                    );
                })}
                {filteredRooms.length === 0 && (
                    <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center', padding: 30 }}>
                        Chưa có phòng nào trong tòa nhà này
                    </p>
                )}
            </div>

            {/* Room detail modal */}
            <Modal open={!!detailRoom} onClose={() => setDetailRoom(null)}
                title={`Chi tiết phòng ${detailRoom?.room_number} - ${detailRoom?.building_id?.name}`} width={560}>
                {detailRoom && (
                    <div>
                        <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
                            {[
                                { label: 'Loại phòng', value: detailRoom.room_type },
                                { label: 'Giá/tháng', value: `${(detailRoom.price_per_month || 0).toLocaleString('vi-VN')} VNĐ` },
                                { label: 'Trạng thái', value: <StatusBadge status={detailRoom.status} /> },
                            ].map(({ label, value }) => (
                                <div key={label} style={{ flex: 1, background: 'var(--bg)', borderRadius: 8, padding: 12 }}>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
                                    <div style={{ fontWeight: 700, fontSize: 14 }}>{value}</div>
                                </div>
                            ))}
                        </div>
                        <h4 style={{ marginBottom: 12, fontSize: 14, fontWeight: 700 }}>Danh sách giường</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {detailRoom.beds?.map(bed => (
                                <div key={bed._id} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '10px 14px', borderRadius: 8,
                                    background: bed.status === 'occupied' ? '#dbeafe' : bed.status === 'maintenance' ? '#f3f4f6' : '#dcfce7',
                                    border: '1px solid var(--border)',
                                }}>
                                    <div>
                                        <span style={{ fontWeight: 700 }}>Giường {bed.bed_number}</span>
                                        {bed.student_id && (
                                            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>
                                                {bed.student_id.fullname} ({bed.student_id.student_code})
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                        <StatusBadge status={bed.status} />
                                        {bed.status === 'available' && (
                                            <Button size="sm" variant="ghost"
                                                onClick={() => handleBedStatus(detailRoom._id, bed._id, 'maintenance')}>
                                                Bảo trì
                                            </Button>
                                        )}
                                        {bed.status === 'maintenance' && (
                                            <Button size="sm" variant="success"
                                                onClick={() => handleBedStatus(detailRoom._id, bed._id, 'available')}>
                                                Khôi phục
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Add room modal */}
            <Modal open={addRoomModal} onClose={() => setAddRoomModal(false)} title="Thêm phòng mới">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Số phòng *</label>
                        <input value={form.room_number} onChange={e => setForm({ ...form, room_number: e.target.value })}
                            placeholder="101" style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14 }} />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Tòa nhà *</label>
                        <select value={form.building_id} onChange={e => setForm({ ...form, building_id: e.target.value })}
                            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14 }}>
                            <option value="">-- Chọn tòa nhà --</option>
                            {buildings.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                        </select>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Loại phòng</label>
                        <select value={form.room_type} onChange={e => setForm({ ...form, room_type: e.target.value })}
                            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14 }}>
                            <option value="4-person">4 người</option>
                            <option value="6-person">6 người</option>
                            <option value="8-person">8 người</option>
                        </select>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Giá/tháng (VNĐ)</label>
                        <input type="number" value={form.price_per_month} onChange={e => setForm({ ...form, price_per_month: +e.target.value })}
                            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14 }} />
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <Button variant="ghost" onClick={() => setAddRoomModal(false)}>Hủy</Button>
                    <Button loading={submitting} onClick={handleAddRoom}><Plus size={14} /> Thêm phòng</Button>
                </div>
            </Modal>
        </div>
    );
};

export default AdminRooms;