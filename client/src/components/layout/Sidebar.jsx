import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard, Building2, FileText, CreditCard,
    MessageSquare, Bell, LogOut, User, Home, Receipt,
} from 'lucide-react';

const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/rooms', icon: Building2, label: 'Sơ đồ phòng' },
    { to: '/admin/registrations', icon: FileText, label: 'Hồ sơ đăng ký' },
    { to: '/admin/billing', icon: CreditCard, label: 'Tài chính' },
    { to: '/admin/requests', icon: MessageSquare, label: 'Yêu cầu' },
    { to: '/admin/notifications', icon: Bell, label: 'Thông báo' },
];

const studentLinks = [
    { to: '/student/home', icon: Home, label: 'Trang chủ' },
    { to: '/student/room', icon: Building2, label: 'Phòng của tôi' },
    { to: '/student/registration', icon: FileText, label: 'Đăng ký nội trú' },
    { to: '/student/billing', icon: Receipt, label: 'Hóa đơn' },
    { to: '/student/requests', icon: MessageSquare, label: 'Yêu cầu hỗ trợ' },
    { to: '/student/notifications', icon: Bell, label: 'Thông báo' },
];

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const links = user?.role === 'admin' ? adminLinks : studentLinks;

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <aside style={{
            width: 'var(--sidebar-width)',
            minHeight: '100vh',
            background: '#1a1a1a',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            top: 0, left: 0, bottom: 0,
            zIndex: 100,
        }}>
            {/* Logo */}
            <div style={{ padding: '24px 20px', borderBottom: '1px solid #333' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, fontWeight: 700, color: '#fff',
                    }}>K</div>
                    <div>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>KTX HUST</div>
                        <div style={{ color: '#9ca3af', fontSize: 11 }}>
                            {user?.role === 'admin' ? 'Ban Quản lý' : 'Sinh viên'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Nav links */}
            <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
                {links.map(({ to, icon: Icon, label }) => (
                    <NavLink key={to} to={to} style={({ isActive }) => ({
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '11px 20px',
                        color: isActive ? '#fff' : '#9ca3af',
                        background: isActive ? 'var(--primary)' : 'transparent',
                        borderRadius: isActive ? '0 8px 8px 0' : 0,
                        marginRight: 12,
                        fontSize: 14,
                        fontWeight: isActive ? 600 : 400,
                        transition: 'all .15s',
                        textDecoration: 'none',
                    })}>
                        <Icon size={16} />
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* User info + logout */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid #333' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: '#374151',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <User size={16} color="#9ca3af" />
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {user?.student?.fullname || user?.username}
                        </div>
                        <div style={{ color: '#9ca3af', fontSize: 11 }}>{user?.username}</div>
                    </div>
                </div>
                <button onClick={handleLogout} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 12px', borderRadius: 8,
                    background: '#374151', border: 'none',
                    color: '#9ca3af', fontSize: 13, cursor: 'pointer',
                }}>
                    <LogOut size={14} /> Đăng xuất
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;