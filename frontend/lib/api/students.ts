import { apiRequest } from './config';

export interface Student {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export interface CreateStudentData {
  email: string;
  fullName: string;
  password: string;
}

export interface UpdateStudentData {
  fullName?: string;
  email?: string;
  password?: string;
}

export interface PaginatedStudentsResponse {
  items: Student[];
  totalItems: number;
  page: number;
  pageSize: number;
}

export const studentsApi = {
  getAll: async (page: number = 1, pageSize: number = 10, search?: string): Promise<PaginatedStudentsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    if (search) params.append('search', search);

    return apiRequest(`/students?${params.toString()}`);
  },

  getById: async (id: string): Promise<Student> => {
    return apiRequest(`/students/${id}`);
  },

  create: async (data: CreateStudentData): Promise<Student> => {
    return apiRequest('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: UpdateStudentData): Promise<Student> => {
    return apiRequest(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiRequest(`/students/${id}`, {
      method: 'DELETE',
    });
  },
};
