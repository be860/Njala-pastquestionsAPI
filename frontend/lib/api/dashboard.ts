import { apiRequest, getAuthToken, API_CONFIG } from './config';

export interface StudentDashboardStats {
  downloadCount: number;
  documentsCount: number;
  recentDocuments: Array<{
    id: number;
    title: string;
    courseCode: string;
    year: number;
    uploadDate: string;
  }>;
}

export interface GlobalStats {
  admins: number;
  students: number;
  documents: number;
  downloads: number;
}

export const dashboardApi = {
  getStudentDashboard: async (): Promise<StudentDashboardStats> => {
    const [downloadCount, documentsCount, recentDocuments] = await Promise.all([
      apiRequest<{ count: number }>('/student-dashboard/download-count'),
      apiRequest<{ count: number }>('/student-dashboard/documents/count'),
      apiRequest<Array<{
        id: number;
        title: string;
        courseCode: string;
        year: number;
        uploadDate: string;
      }>>('/student-dashboard/documents/recent'),
    ]);

    return {
      downloadCount: downloadCount.count,
      documentsCount: documentsCount.count,
      recentDocuments,
    };
  },

  getGlobalStats: async (): Promise<GlobalStats> => {
    return apiRequest('/stats/global');
  },

  downloadDocument: async (id: number): Promise<Blob> => {
    const token = localStorage.getItem('token');
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'https://njala-pastquestionsapi.onrender.com/api'}/student-dashboard/download/${id}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download document');
    }

    return response.blob();
  },

  updateProfile: async (formData: FormData): Promise<{ fullName: string; email: string; avatarUrl?: string }> => {
    const token = getAuthToken();
    const url = `${API_CONFIG.baseURL}/student-dashboard/profile`;

    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};
