import api from './api';

export const roomService = {
    getBuildings: () => api.get('/rooms/buildings'),
    createBuilding: (data) => api.post('/rooms/buildings', data),
    getRooms: (params) => api.get('/rooms', { params }),
    getRoomById: (id) => api.get(`/rooms/${id}`),
    createRoom: (data) => api.post('/rooms', data),
    updateRoom: (id, data) => api.patch(`/rooms/${id}`, data),
    deleteRoom: (id) => api.delete(`/rooms/${id}`),
    updateBedStatus: (roomId, bedId, data) => api.patch(`/rooms/${roomId}/beds/${bedId}`, data),
};