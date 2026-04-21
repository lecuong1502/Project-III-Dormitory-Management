import api from './api';

export const registrationService = {
    getAll: (params) => api.get('/registrations', { params }),
    getMy: () => api.get('/registrations/my'),
    submit: (data) => api.post('/registrations', data),
    approve: (id, data) => api.patch(`/registrations/${id}/approve`, data),
    reject: (id, data) => api.patch(`/registrations/${id}/reject`, data),
};