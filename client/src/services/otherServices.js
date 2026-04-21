import api from './api';

export const requestService = {
    getAll: (params) => api.get('/requests', { params }),
    getMy: () => api.get('/requests/my'),
    create: (formData) => api.post('/requests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    updateStatus: (id, data) => api.patch(`/requests/${id}/status`, data),
}

export const notificationService = {
    getAll: () => api.get('/notifications'),
    getMy: () => api.get('/notifications/my'),
    send: (data) => api.post('/notifications', data),
    markRead: (id) => api.patch(`/notifications/${id}/read`),
    markAllRead: () => api.patch('/notifications/mark-all-read'),
};

export const dashboardService = {
    getStats: () => api.get('/dashboard/stats'),
};