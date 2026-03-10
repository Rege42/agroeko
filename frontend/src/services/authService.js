import api from './api';
import { ref } from 'vue';

export const isAuth = ref(!!localStorage.getItem('token'));

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });

  console.log(response.data);
  console.log(response.data.data.accessToken);
  const token = response.data.data.accessToken;
  localStorage.setItem('token', token);
  isAuth.value = true;

  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  isAuth.value = false;
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const isAuthenticated = () => {
  return isAuth.value;
};
