import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Media API
export const mediaAPI = {
  getAll: () => api.get('/api/media'),
  get: (id) => api.get(`/api/media/${id}`),
  create: (data) => api.post('/api/media', data),
  update: (id, data) => api.put(`/api/media/${id}`, data),
  delete: (id) => api.delete(`/api/media/${id}`),
  addMedia: (id, formData) => api.post(`/api/media/${id}/add-media`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Upload API with proper progress handling
export const uploadAPI = {
  upload: (formData, onProgress) => 
    api.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 100)
          );
          onProgress(percentCompleted);
        }
      },
    }),
};

export default api;