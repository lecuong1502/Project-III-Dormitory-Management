import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.username || !form.password) return toast.error('Vui lòng nhập đầy đủ thông tin.');
        setLoading(true);
        try {
            const user = await login(form);
            toast.success('Đăng nhập thành công!');
            navigate(user.role === 'admin' ? '/admin/dashboard' : '/student/home');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Đăng nhập thất bại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1515 50%, #1a1a1a 100%)',
        }}>
            {/* Left panel */}
            <div style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 40, color: '#fff',
            }}>
                <div style={{ maxWidth: 420 }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: 16,
                        background: 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 32, fontWeight: 700, color: '#fff', marginBottom: 28,
                    }}>K</div>
                    <h1 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 38, fontWeight: 700, lineHeight: 1.2, marginBottom: 16,
                    }}>
                        Hệ thống<br />Quản lý Ký túc xá
                    </h1>
                    <p style={{ color: '#9ca3af', fontSize: 15, lineHeight: 1.7 }}>
                        Đại học Bách Khoa Hà Nội — Nền tảng quản lý toàn bộ quy trình
                        lưu trú từ đăng ký, xếp phòng đến thanh toán.
                    </p>
                </div>
            </div>

            {/* Right panel — form */}
            <div style={{
                width: 440, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#fff', padding: 48,
            }}>
                <div style={{ width: '100%' }}>
                    <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Đăng nhập</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>
                        Chào mừng bạn quay trở lại
                    </p>

                    <form onSubmit={handleSubmit}>
                        <Input
                            label="Email / Mã sinh viên"
                            name="username"
                            type="text"
                            placeholder="student@hust.edu.vn"
                            value={form.username}
                            onChange={handleChange}
                        />
                        <Input
                            label="Mật khẩu"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={handleChange}
                        />

                        <Button
                            type="submit"
                            loading={loading}
                            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15, marginTop: 8 }}
                        >
                            Đăng nhập
                        </Button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)' }}>
                        Chưa có tài khoản?{' '}
                        <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;