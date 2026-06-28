import { apiRequest } from './config';

export interface ReferencedDocument {
  id: number;
  title: string;
  courseCode: string;
  year: number;
}

export interface TutorQuestionResponse {
  question: string;
  answer: string;
  sessionTitle?: string;
  referencedDocument?: ReferencedDocument | null;
  userMessage?: ChatMessageDto;
  assistantMessage?: ChatMessageDto;
}

export interface ChatSessionSummary {
  id: string;
  title: string;
  documentId?: number | null;
  documentTitle?: string | null;
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
  documentId?: number | null;
  documentTitle?: string | null;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessageDto[];
}

export const aiTutorApi = {
  getSessions: async (): Promise<ChatSessionSummary[]> => {
    return apiRequest('/ai-tutor/sessions');
  },

  createSession: async (options?: { title?: string; documentId?: number }): Promise<ChatSessionSummary> => {
    return apiRequest('/ai-tutor/sessions', {
      method: 'POST',
      body: JSON.stringify({
        title: options?.title,
        documentId: options?.documentId,
      }),
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

  sendMessage: async (
    sessionId: string,
    question: string,
    documentId?: number
  ): Promise<TutorQuestionResponse> => {
    return apiRequest(`/ai-tutor/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ question, documentId }),
    });
  },

  askQuestion: async (question: string): Promise<TutorQuestionResponse> => {
    return apiRequest('/ai-tutor/ask', {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
  },
};
