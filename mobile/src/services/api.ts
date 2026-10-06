import axios from 'axios';
import { getToken, deleteToken } from './storage';

// Replace IP address with actual local machine IP or deployed backend URL
export const API_BASE_URL = 'http://10.0.2.2:5000/api'; // 10.0.2.2 points to localhost in Android Emulator

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

let onUnauthorizedCallback: ((message: string) => void) | null = null;
let onNetworkErrorCallback: ((message: string) => void) | null = null;

export const setApiErrorListeners = (
  onUnauthorized: (msg: string) => void,
  onNetworkError: (msg: string) => void
) => {
  onUnauthorizedCallback = onUnauthorized;
  onNetworkErrorCallback = onNetworkError;
};

api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      // Network failure / No connection
      if (onNetworkErrorCallback) {
        onNetworkErrorCallback('No network connection available. Please check your internet connection.');
      }
      return Promise.reject(new Error('Network error: Unable to connect to server'));
    }

    if (error.response.status === 401) {
      await deleteToken();
      const msg = error.response.data?.message || 'Your session has expired. Please log in again.';
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback(msg);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
