import { apiRequest } from './config';

export interface SuperAdminStats {
  admins: number;
  students: number;
  documents: number;
  downloads: number;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export interface RecentDocument {
  id: number;
  title: string;
  courseCode: string;
  year: number;
  uploadDate: string;
}

export const superadminApi = {
  getStats: async (): Promise<SuperAdminStats> => {
    // Use the global stats endpoint which is the correct one
    return apiRequest('/stats/global');
  },

  getUsers: async (): Promise<User[]> => {
    return apiRequest('/superadmin/users');
  },

  promoteToAdmin: async (id: string): Promise<{ message: string }> => {
    return apiRequest(`/superadmin/promote/${id}`, {
      method: 'PUT',
    });
  },

  deleteUser: async (id: string): Promise<void> => {
    return apiRequest(`/superadmin/users/${id}`, {
      method: 'DELETE',
    });
  },

  createAdmin: async (email: string, fullName: string, password: string): Promise<{ message: string }> => {
    return apiRequest('/superadmin/create-admin', {
      method: 'POST',
      body: JSON.stringify({ email, fullName, password }),
    });
  },

  getRecentDocuments: async (): Promise<RecentDocument[]> => {
    return apiRequest('/superadmin/documents/recent');
  },

  updateDocument: async (id: number, data: {
    title?: string;
    description?: string;
    courseCode?: string;
    year?: number;
  }): Promise<{ message: string }> => {
    return apiRequest(`/superadmin/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteDocument: async (id: number): Promise<void> => {
    return apiRequest(`/superadmin/documents/${id}`, {
      method: 'DELETE',
    });
  },
};

