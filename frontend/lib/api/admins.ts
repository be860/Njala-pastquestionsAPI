import { apiRequest } from './config';

export interface Admin {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export interface CreateAdminData {
  email: string;
  fullName: string;
  password: string;
}

export interface UpdateAdminData {
  fullName?: string;
  email?: string;
  password?: string;
}

export interface PaginatedAdminsResponse {
  items: Admin[];
  totalItems: number;
  page: number;
  pageSize: number;
}

export const adminsApi = {
  getAll: async (page: number = 1, pageSize: number = 10, search?: string): Promise<PaginatedAdminsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    if (search) params.append('search', search);

    const response = await apiRequest<{
      Items?: Admin[];
      items?: Admin[];
      TotalItems?: number;
      totalItems?: number;
      Page?: number;
      page?: number;
      PageSize?: number;
      pageSize?: number;
    }>(`/admins?${params.toString()}`);
    // Convert backend response format to frontend format (support PascalCase and camelCase)
    const items = response?.Items ?? response?.items ?? [];
    const totalItems = response?.TotalItems ?? response?.totalItems ?? items.length;
    const pageNum = response?.Page ?? response?.page ?? page;
    const pageSizeNum = response?.PageSize ?? response?.pageSize ?? pageSize;
    return {
      items,
      totalItems,
      page: pageNum,
      pageSize: pageSizeNum,
    };
  },

  getById: async (id: string): Promise<Admin> => {
    return apiRequest(`/admins/${id}`);
  },

  create: async (data: CreateAdminData): Promise<Admin> => {
    return apiRequest('/admins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: UpdateAdminData): Promise<Admin> => {
    return apiRequest(`/admins/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiRequest(`/admins/${id}`, {
      method: 'DELETE',
    });
  },

  approve: async (id: string): Promise<{ message: string }> => {
    return apiRequest(`/admins/approve/${id}`, {
      method: 'POST',
    });
  },

  reject: async (id: string): Promise<{ message: string }> => {
    return apiRequest(`/admins/reject/${id}`, {
      method: 'POST',
    });
  },

  getPending: async (): Promise<Admin[]> => {
    return apiRequest('/admins/pending');
  },
};
