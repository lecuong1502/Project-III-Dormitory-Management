// Format currency in VND
export const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

// Format date to dd/MM/yyyy
export const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN');
};

// Format month "2026-03" → "Tháng 03/2026"
export const formatMonth = (month) => {
    if (!month) return '—';
    const [y, m] = month.split('-');
    return `Tháng ${m}/${y}`;
};

// Status badge config
export const statusConfig = {
    // Registration
    pending: { label: 'Chờ duyệt', color: '#d97706', bg: '#fef3c7' },
    approved: { label: 'Đã duyệt', color: '#16a34a', bg: '#dcfce7' },
    rejected: { label: 'Từ chối', color: '#dc2626', bg: '#fee2e2' },
    // Invoice
    unpaid: { label: 'Chưa thanh toán', color: '#dc2626', bg: '#fee2e2' },
    pending_verification: { label: 'Chờ xác nhận', color: '#d97706', bg: '#fef3c7' },
    paid: { label: 'Đã thanh toán', color: '#16a34a', bg: '#dcfce7' },
    // Request
    new: { label: 'Mới tạo', color: '#2563eb', bg: '#dbeafe' },
    processing: { label: 'Đang xử lý', color: '#d97706', bg: '#fef3c7' },
    completed: { label: 'Hoàn thành', color: '#16a34a', bg: '#dcfce7' },
    // Bed
    available: { label: 'Trống', color: '#16a34a', bg: '#dcfce7' },
    occupied: { label: 'Có người', color: '#2563eb', bg: '#dbeafe' },
    maintenance: { label: 'Bảo trì', color: '#6b7280', bg: '#f3f4f6' },
};

// Category labels for requests
export const categoryLabels = {
    maintenance: 'Báo hỏng thiết bị',
    room_transfer: 'Xin chuyển phòng',
    checkout: 'Xin trả phòng',
    other: 'Khác',
};