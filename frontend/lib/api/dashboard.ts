import { apiRequest, API_CONFIG, fetchWithAuth } from './config';

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

export interface StudentAnalytics {
  overallProgress: number;
  totalDownloads: number;
  downloadsThisWeek: number;
  downloadWeeklyChange: number;
  uniqueDocumentsDownloaded: number;
  totalDocuments: number;
  studyTime: {
    totalHours: number;
    totalMinutes: number;
    thisWeekHours: number;
    thisWeekMinutes: number;
    weeklyChangePercent: number;
  };
  bestSubject: {
    subject: string;
    score: number;
  } | null;
  subjectPerformance: Array<{
    subject: string;
    downloads: number;
    studyMinutes: number;
    engagementScore: number;
  }>;
  weeklyTrend: Array<{
    week: string;
    downloads: number;
    studyHours: number;
    studyMinutes: number;
    engagementScore: number;
  }>;
  studyTimeBySubject: Array<{
    subject: string;
    totalMinutes: number;
  }>;
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

  getAnalytics: async (): Promise<StudentAnalytics> => {
    return apiRequest('/student-dashboard/analytics');
  },

  downloadDocument: async (id: number): Promise<Blob> => {
    const { blob } = await fetchStudentDocument(id, 'download')
    return blob
  },

  updateProfile: async (formData: FormData): Promise<{ fullName: string; email: string; avatarUrl?: string }> => {
    const url = `${API_CONFIG.baseURL}/student-dashboard/profile`;

    const response = await fetchWithAuth(url, {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};

async function fetchStudentDocument(
  id: number,
  mode: 'download'
): Promise<{ blob: Blob; fileName: string }> {
  const url = `${API_CONFIG.baseURL}/student-dashboard/${mode}/${id}`

  const response = await fetchWithAuth(url)

  if (!response.ok) {
    throw new Error(mode === 'view' ? 'Failed to load document' : 'Failed to download document')
  }

  const contentType = response.headers.get('content-type') || 'application/pdf'
  const arrayBuffer = await response.arrayBuffer()
  const blob = new Blob([arrayBuffer], { type: contentType })

  const disposition = response.headers.get('content-disposition')
  let fileName = `document-${id}.pdf`
  if (disposition) {
    const match = disposition.match(/filename\*?=(?:UTF-8''|")?([^";\n]+)/i)
    if (match?.[1]) {
      fileName = decodeURIComponent(match[1].replace(/['"]/g, ''))
    }
  }

  return { blob, fileName }
}

export function saveDocumentBlob(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  setTimeout(() => {
    window.URL.revokeObjectURL(url)
    document.body.removeChild(anchor)
  }, 200)
}
