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

export default api;