import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // вместо 'http://localhost:3000/api'
  headers: {
    'Content-Type': 'application/json',
  },
});

export const forecast = {
  getYieldForecast(cropId, method = 'linear_trend', years = 5) {
    return api.get('/analytics/forecast/yield', { params: { cropId, method, years } });
  },
  getPriceForecast(cropId, months = 3) {
    return api.get('/analytics/forecast/price', { params: { cropId, months } });
  },
};

export const fieldApi = {
  async getAll(params = {}) {
    const response = await api.get("/fields", { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/fields/${id}`);
    return response.data;
  },

  async create(payload) {
    const response = await api.post('/fields', payload);
    return response.data;
  },

  async update(id, payload) {
    const response = await api.patch(`/fields/${id}`, payload);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/fields/${id}`);
    return response.data;
  },
};

export const CropsRotationApi = {
  async getAll(params = {}) {
    const response = await api.get("/crop-rotation-entries", { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/crop-rotation-entries/${id}`);
    return response.data;
  },

  async create(payload) {
    const response = await api.post('/crop-rotation-entries', payload);
    return response.data;
  },

  async update(id, payload) {
    const response = await api.patch(`/crop-rotation-entries/${id}`, payload);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/crop-rotation-entries/${id}`);
    return response.data;
  },
};

export const cropApi = {
  async getAll(params = {}) {
    const response = await api.get("/crops", { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/crops/${id}`);
    return response.data;
  },
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      router.push('/login');
    }

    return Promise.reject(error);
  }
);

export default api;