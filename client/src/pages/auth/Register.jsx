import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const Register = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        student_code: '', fullname: '', email: '', password: '', phone: '', gender: 'male',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.student_code || !form.fullname || !form.email || !form.password)
            return toast.error('Vui lòng điền đầy đủ các trường bắt buộc.');
        if (form.password.length < 6)
            return toast.error('Mật khẩu phải có ít nhất 6 ký tự.');
        setLoading(true);
        try {
            await authService.register(form);
            toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Đăng ký thất bại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1515 50%, #1a1a1a 100%)',
            padding: 20,
        }}>
            <div style={{
                background: '#fff', borderRadius: 16, padding: 40,
                width: '100%', maxWidth: 520,
                boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
            }}>
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{
                        width: 52, height: 52, borderRadius: 12,
                        background: 'var(--primary)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 26, fontWeight: 700, color: '#fff', marginBottom: 12,
                    }}>K</div>
                    <h2 style={{ fontSize: 22, fontWeight: 700 }}>Tạo tài khoản</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
                        Hệ thống Quản lý Ký túc xá HUST
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                        <Input label="Mã sinh viên *" name="student_code" placeholder="20235025"
                            value={form.student_code} onChange={handleChange} />
                        <Input label="Họ và tên *" name="fullname" placeholder="Nguyễn Văn A"
                            value={form.fullname} onChange={handleChange} />
                    </div>
                    <Input label="Email *" name="email" type="email" placeholder="student@hust.edu.vn"
                        value={form.email} onChange={handleChange} />
                    <Input label="Mật khẩu *" name="password" type="password" placeholder="Tối thiểu 6 ký tự"
                        value={form.password} onChange={handleChange} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                        <Input label="Số điện thoại" name="phone" placeholder="09xxxxxxxx"
                            value={form.phone} onChange={handleChange} />
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                                Giới tính
                            </label>
                            <select name="gender" value={form.gender} onChange={handleChange}
                                style={{
                                    width: '100%', padding: '9px 12px',
                                    border: '1.5px solid var(--border)', borderRadius: 8,
                                    fontSize: 14, background: '#fff',
                                }}>
                                <option value="male">Nam</option>
                                <option value="female">Nữ</option>
                                <option value="other">Khác</option>
                            </select>
                        </div>
                    </div>

                    <Button type="submit" loading={loading}
                        style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15, marginTop: 4 }}>
                        Đăng ký
                    </Button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: 'var(--text-muted)' }}>
                    Đã có tài khoản?{' '}
                    <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Đăng nhập</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;