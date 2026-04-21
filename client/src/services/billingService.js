import api from './api';

export const billingService = {
    getAllInvoices: (params) => api.get('/billing/invoices', { params }),
    getMyInvoices: () => api.get('/billing/invoices/my'),
    generateInvoices: (data) => api.post('/billing/generate', data),
    submitProof: (id, formData) => api.patch(`/billing/${id}/submit-proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    confirmPayment: (id) => api.patch(`/billing/${id}/confirm`),
    rejectPayment: (id, data) => api.patch(`/billing/${id}/reject`, data),
};