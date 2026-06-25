import { apiRequest, apiRequestFormData, API_CONFIG, fetchWithAuth } from './config';

export interface Document {
  id: number;
  title: string;
  description: string;
  courseCode: string;
  year: number;
  filePath: string;
  uploader: string;
  uploadDate: string;
  summary?: string;
}

export interface DocumentUploadData {
  title: string;
  description: string;
  courseCode: string;
  year: number;
  file: File;
}

export interface PaginatedDocumentsResponse {
  items: Document[];
  totalItems: number;
  page: number;
  pageSize: number;
}

export const documentsApi = {
  getAll: async (
    page: number = 1,
    pageSize: number = 10,
    search?: string,
    courseCode?: string,
    year?: number
  ): Promise<PaginatedDocumentsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    if (search) params.append('search', search);
    if (courseCode) params.append('courseCode', courseCode);
    if (year) params.append('year', year.toString());

    return apiRequest(`/document?${params.toString()}`);
  },

  getById: async (id: number): Promise<Document> => {
    return apiRequest(`/document/${id}`);
  },

  upload: async (data: DocumentUploadData): Promise<{ message: string; document: Document }> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('courseCode', data.courseCode);
    formData.append('year', data.year.toString());
    formData.append('file', data.file);

    return apiRequestFormData('/document/upload', formData);
  },

  download: async (id: number): Promise<Blob> => {
    const url = `${API_CONFIG.baseURL}/document/download/${id}`;
    
    const response = await fetchWithAuth(url);

    if (!response.ok) {
      throw new Error('Failed to download document');
    }

    const contentType = response.headers.get('content-type') || 'application/pdf';
    const arrayBuffer = await response.arrayBuffer();
    return new Blob([arrayBuffer], { type: contentType });
  },

  delete: async (id: number): Promise<{ message: string }> => {
    return apiRequest(`/document/${id}`, {
      method: 'DELETE',
    });
  },

  generateAISummary: async (id: number): Promise<{ message: string; summary: string }> => {
    return apiRequest(`/document/ai-summary/${id}`, {
      method: 'POST',
    });
  },
};
