import { apiRequest } from './config';

export interface TutorQuestionResponse {
  question: string;
  answer: string;
}

export const aiTutorApi = {
  askQuestion: async (question: string): Promise<TutorQuestionResponse> => {
    return apiRequest('/ai-tutor/ask', {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
  },
};

