import { ApiResponse, Bill, Category, Device, Usage } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Replace with your actual backend URL when it's set up
const API_BASE_URL = 'http://10.0.0.100:3000/api'; // Example URL

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  } catch (error) {
    return Promise.reject(error);
  }
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      await AsyncStorage.removeItem('authToken');
      // You might want to trigger a navigation to login screen here
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    apiClient.post<{ id: string; name: string; email: string; token: string }>('/users/register', data),
  login: (data: { email: string; password: string }) =>
    apiClient.post<{ id: string; name: string; email: string; token: string }>('/users/login', data),
  getProfile: () => apiClient.get<{ id: string; name: string; email: string }>('/users/profile'),
  updateProfile: (data: { name?: string; email?: string; password?: string }) =>
    apiClient.patch<{ id: string; name: string; email: string }>('/users/profile', data),
};

export const categoriesAPI = {
  getAll: () => apiClient.get<ApiResponse<Category[]>>('/categories'),
  getById: (id: string) => apiClient.get<ApiResponse<Category>>(`/categories/${id}`),
  create: (data: { name: string; iconName?: string }) =>
    apiClient.post<ApiResponse<Category>>('/categories', data),
  update: (id: string, data: { name?: string; iconName?: string }) =>
    apiClient.patch<ApiResponse<Category>>(`/categories/${id}`, data),
  delete: (id: string) => apiClient.delete<ApiResponse<void>>(`/categories/${id}`),
};

export const devicesAPI = {
  getAll: () => apiClient.get<Device[]>('/devices'),
  getById: (id: string) => apiClient.get<Device>(`/devices/${id}`),
  create: (data: { name: string; categoryId: string }) =>
    apiClient.post<Device>('/devices', data),
  update: (id: string, data: { name?: string; categoryId?: string }) =>
    apiClient.patch<Device>(`/devices/${id}`, data),
  delete: (id: string) => apiClient.delete<void>(`/devices/${id}`),
};

export const usageAPI = {
  getAll: () => apiClient.get<Usage[]>('/usages'),
  getById: (id: string) => apiClient.get<Usage>(`/usages/${id}`),
  getByDevice: (deviceId: string) => apiClient.get<Usage[]>(`/usages/device/${deviceId}`),
  create: (data: { deviceId: string; value: number; notes?: string }) =>
    apiClient.post<Usage>('/usages', data),
  update: (id: string, data: { value?: number; notes?: string }) =>
    apiClient.patch<Usage>(`/usages/${id}`, data),
  delete: (id: string) => apiClient.delete<void>(`/usages/${id}`),
};

export const billsAPI = {
  getAll: () => apiClient.get<ApiResponse<Bill[]>>('/bills'),
  getById: (id: string) => apiClient.get<ApiResponse<Bill>>(`/bills/${id}`),
  create: (data: {
    amount: number;
    dueDate: string;
    waterUsed: number;
    billPeriodStart: string;
    billPeriodEnd: string;
    photoUrl?: string;
  }) => apiClient.post<ApiResponse<Bill>>('/bills', data),
  update: (id: string, data: {
    amount?: number;
    dueDate?: string;
    waterUsed?: number;
    billPeriodStart?: string;
    billPeriodEnd?: string;
    photoUrl?: string;
  }) => apiClient.patch<ApiResponse<Bill>>(`/bills/${id}`, data),
  markAsPaid: (id: string, data: { paidDate: string }) =>
    apiClient.patch<ApiResponse<Bill>>(`/bills/${id}/paid`, data),
  delete: (id: string) => apiClient.delete<ApiResponse<void>>(`/bills/${id}`),
};

export default apiClient; 