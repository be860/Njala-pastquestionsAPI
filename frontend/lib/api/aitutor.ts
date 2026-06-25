import { apiRequest } from './config';

export interface TutorQuestionResponse {
  question: string;
  answer: string;
  sessionTitle?: string;
  userMessage?: ChatMessageDto;
  assistantMessage?: ChatMessageDto;
}

export interface ChatSessionSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface ChatMessageDto {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ChatSessionDetail {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessageDto[];
}

export const aiTutorApi = {
  getSessions: async (): Promise<ChatSessionSummary[]> => {
    return apiRequest('/ai-tutor/sessions');
  },

  createSession: async (title?: string): Promise<ChatSessionSummary> => {
    return apiRequest('/ai-tutor/sessions', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  },

  getSession: async (sessionId: string): Promise<ChatSessionDetail> => {
    return apiRequest(`/ai-tutor/sessions/${sessionId}`);
  },

  deleteSession: async (sessionId: string): Promise<{ message: string }> => {
    return apiRequest(`/ai-tutor/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  },

  sendMessage: async (sessionId: string, question: string): Promise<TutorQuestionResponse> => {
    return apiRequest(`/ai-tutor/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
  },

  askQuestion: async (question: string): Promise<TutorQuestionResponse> => {
    return apiRequest('/ai-tutor/ask', {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
  },
};
