import axios from "axios";

const api = axios.create({
  baseURL: "/api", // вместо 'http://localhost:3000/api'
  headers: {
    "Content-Type": "application/json",
  },
});

export const forecast = {
  getYieldForecast(cropId, method = "linear_trend", years = 5) {
    return api.get("/analytics/forecast/yield", {
      params: { cropId, method, years },
    });
  },
  getPriceForecast(cropId, months = 3) {
    return api.get("/analytics/forecast/price", { params: { cropId, months } });
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
    const response = await api.post("/fields", payload);
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

export const cropsRotationApi = {
  async getAll(params = {}) {
    const response = await api.get("/crop-rotation-entries", { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/crop-rotation-entries/${id}`);
    return response.data;
  },

  async create(payload) {
    const response = await api.post("/crop-rotation-entries", payload);
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

export const getCropCompatibilityMatrix = async () => {
  const response = await api.get("/crop-compatibility/matrix");
  return response.data;
};

export const getCropSelection = async (fieldId) => {
  const { data } = await api.get(
    `/crop-compatibility/crop-selection/${fieldId}`,
  );
  return data;
};

export const agroPlanApi = {
  async getPlans(params = {}) {
    const { data } = await api.get("/agro-plans", { params });
    return data;
  },

  async getPlanById(id) {
    const { data } = await api.get(`/agro-plans/${id}`);
    return data;
  },

  async createPlan(payload) {
    const { data } = await api.post("/agro-plans", payload);
    return data;
  },

  async updatePlan(id, payload) {
    const { data } = await api.patch(`/agro-plans/${id}`, payload);
    return data;
  },

  async deletePlan(id) {
    const { data } = await api.delete(`/agro-plans/${id}`);
    return data;
  },

  async getSteps(params = {}) {
    const { data } = await api.get("/agro-plan-steps", { params });
    return data;
  },

  async createStep(payload) {
    const { data } = await api.post("/agro-plan-steps", payload);
    return data;
  },

  async updateStep(id, payload) {
    const { data } = await api.patch(`/agro-plan-steps/${id}`, payload);
    return data;
  },

  async deleteStep(id) {
    const { data } = await api.delete(`/agro-plan-steps/${id}`);
    return data;
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
      localStorage.removeItem("token");
      router.push("/login");
    }

    return Promise.reject(error);
  },
);

export default api;
