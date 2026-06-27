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

export interface ActiveStudySession {
  id: string;
  startTime: string;
  subject?: string;
}

export const studyTimeApi = {
  startSession: async (subject?: string): Promise<{ id: string; startTime: string; resumed?: boolean }> => {
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

  endActiveSession: async (): Promise<{ message?: string; id?: string; durationMinutes?: number }> => {
    return apiRequest('/study-time/end-active', {
      method: 'POST',
    });
  },

  getActiveSession: async (): Promise<ActiveStudySession> => {
    return apiRequest('/study-time/active');
  },

  getStats: async (): Promise<StudyStats> => {
    return apiRequest('/study-time/stats');
  },

  getRecentSessions: async (limit: number = 10): Promise<StudySession[]> => {
    return apiRequest(`/study-time/recent?limit=${limit}`);
  },
};

