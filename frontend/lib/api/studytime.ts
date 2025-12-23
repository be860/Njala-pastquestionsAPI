import { apiRequest } from './config';

export interface StudySession {
  id: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  subject?: string;
}

export interface StudyStats {
  totalHours: number;
  todayHours: number;
  thisWeekHours: number;
  subjectStats: Array<{
    subject: string;
    totalMinutes: number;
  }>;
}

export const studyTimeApi = {
  startSession: async (subject?: string): Promise<{ id: string; startTime: string }> => {
    return apiRequest('/study-time/start', {
      method: 'POST',
      body: JSON.stringify({ subject }),
    });
  },

  endSession: async (sessionId: string): Promise<{
    id: string;
    durationMinutes: number;
    startTime: string;
    endTime: string;
  }> => {
    return apiRequest(`/study-time/end/${sessionId}`, {
      method: 'POST',
    });
  },

  getStats: async (): Promise<StudyStats> => {
    return apiRequest('/study-time/stats');
  },

  getRecentSessions: async (limit: number = 10): Promise<StudySession[]> => {
    return apiRequest(`/study-time/recent?limit=${limit}`);
  },
};

