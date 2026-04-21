import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { roomService } from '../../services/roomService';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import Spinner from '../../components/common/Spinner';
import { Building2, User, BedDouble } from 'lucide-react';

const RoomInfo = () => {
    const { user, refreshUser } = useAuth();
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const student = user?.student;

    useEffect(() => {
        // Always refresh user first to get latest current_contract
        refreshUser().then(() => { }).catch(() => { });
    }, []);

    useEffect(() => {
        const contractRoomId =
            student?.current_contract?.room_id?._id ||
            student?.current_contract?.room_id ||
            null;

        if (contractRoomId) {
            roomService.getRoomById(contractRoomId)
                .then(r => setRoom(r.data.data))
                .catch(() => { })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [student?.current_contract]);

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>;

    if (!room) return (
        <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Phòng của tôi</h1>
            <Card>
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    <Building2 size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
                    <p style={{ fontSize: 16, fontWeight: 600 }}>Bạn chưa được phân bổ phòng</p>
                    <p style={{ fontSize: 14, marginTop: 6 }}>Vui lòng đăng ký nội trú và chờ Ban quản lý xét duyệt.</p>
                </div>
            </Card>
        </div>
    );

    return (
        <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Phòng của tôi</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                {/* Room info */}
                <Card title="Thông tin phòng">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {[
                            { label: 'Tòa nhà', value: room.building_id?.name || '—' },
                            { label: 'Số phòng', value: room.room_number },
                            { label: 'Loại phòng', value: room.room_type },
                            { label: 'Giá phòng/tháng', value: `${(room.price_per_month || 0).toLocaleString('vi-VN')} VNĐ` },
                            { label: 'Trạng thái', value: <StatusBadge status={room.status} /> },
                        ].map(({ label, value }) => (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{label}</span>
                                <span style={{ fontWeight: 600, fontSize: 14 }}>{value}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* My bed */}
                <Card title="Giường của tôi">
                    {room.beds?.filter(b => b.student_id?._id === student?._id || b.student_id === student?._id).map(bed => (
                        <div key={bed._id} style={{
                            background: 'var(--primary-light)', borderRadius: 10,
                            padding: 16, display: 'flex', alignItems: 'center', gap: 12,
                        }}>
                            <BedDouble size={28} color="var(--primary)" />
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 16 }}>Giường {bed.bed_number}</div>
                                <StatusBadge status={bed.status} />
                            </div>
                        </div>
                    ))}
                </Card>
            </div>

            {/* Roommates */}
            <Card title={`Bạn cùng phòng (${room.beds?.filter(b => b.status === 'occupied').length || 0} người)`}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                    {room.beds?.filter(b => b.status === 'occupied').map(bed => (
                        <div key={bed._id} style={{
                            background: 'var(--bg)', borderRadius: 10, padding: 14,
                            display: 'flex', alignItems: 'center', gap: 12,
                            border: '1px solid var(--border)',
                        }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: '50%',
                                background: 'var(--primary-light)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <User size={18} color="var(--primary)" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 13 }}>
                                    {bed.student_id?.fullname || 'Sinh viên'}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                    {bed.student_id?.student_code || '—'} · Giường {bed.bed_number}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default RoomInfo;