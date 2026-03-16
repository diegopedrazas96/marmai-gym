import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
};

// Students
export const studentsApi = {
  getAll: (active?: boolean) =>
    api.get('/students', { params: active !== undefined ? { active } : {} }).then((r) => r.data),
  getOne: (id: number) => api.get(`/students/${id}`).then((r) => r.data),
  create: (data: any) => api.post('/students', data).then((r) => r.data),
  update: (id: number, data: any) => api.put(`/students/${id}`, data).then((r) => r.data),
  deactivate: (id: number) => api.put(`/students/${id}/deactivate`).then((r) => r.data),
  delete: (id: number) => api.delete(`/students/${id}`).then((r) => r.data),
};

// Teachers
export const teachersApi = {
  getAll: () => api.get('/teachers').then((r) => r.data),
  getOne: (id: number) => api.get(`/teachers/${id}`).then((r) => r.data),
  create: (data: any) => api.post('/teachers', data).then((r) => r.data),
  update: (id: number, data: any) => api.put(`/teachers/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/teachers/${id}`).then((r) => r.data),
};

// Disciplines
export const disciplinesApi = {
  getAll: () => api.get('/disciplines').then((r) => r.data),
  getOne: (id: number) => api.get(`/disciplines/${id}`).then((r) => r.data),
  create: (data: any) => api.post('/disciplines', data).then((r) => r.data),
  update: (id: number, data: any) => api.put(`/disciplines/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/disciplines/${id}`).then((r) => r.data),
};

// Schedules
export const schedulesApi = {
  getAll: (disciplineId?: number) =>
    api.get('/schedules', { params: disciplineId ? { disciplineId } : {} }).then((r) => r.data),
  getToday: () => api.get('/schedules/today').then((r) => r.data),
  create: (data: any) => api.post('/schedules', data).then((r) => r.data),
  update: (id: number, data: any) => api.put(`/schedules/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/schedules/${id}`).then((r) => r.data),
};

// Enrollments
export const enrollmentsApi = {
  getByStudent: (studentId: number) =>
    api.get(`/enrollments/student/${studentId}`).then((r) => r.data),
  getByDiscipline: (disciplineId: number) =>
    api.get(`/enrollments/discipline/${disciplineId}`).then((r) => r.data),
  create: (data: { studentId: number; disciplineId: number }) =>
    api.post('/enrollments', data).then((r) => r.data),
  unenroll: (studentId: number, disciplineId: number) =>
    api.delete(`/enrollments/student/${studentId}/discipline/${disciplineId}`).then((r) => r.data),
};

// Payments
export const paymentsApi = {
  getAll: (filters?: { month?: number; year?: number; status?: string; studentId?: number }) =>
    api.get('/payments', { params: filters }).then((r) => r.data),
  getSummary: (month: number, year: number) =>
    api.get('/payments/summary', { params: { month, year } }).then((r) => r.data),
  getByStudent: (studentId: number) =>
    api.get(`/payments/student/${studentId}`).then((r) => r.data),
  create: (data: any) => api.post('/payments', data).then((r) => r.data),
  generate: (month: number, year: number, defaultAmount: number) =>
    api.post('/payments/generate', { month, year, defaultAmount }).then((r) => r.data),
  update: (id: number, data: any) => api.put(`/payments/${id}`, data).then((r) => r.data),
  markAsPaid: (id: number) => api.put(`/payments/${id}/pay`).then((r) => r.data),
  delete: (id: number) => api.delete(`/payments/${id}`).then((r) => r.data),
};
