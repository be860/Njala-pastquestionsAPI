import { apiRequestFormData, getAuthToken, API_CONFIG } from './config';

export interface ProfileData {
  fullName: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
}

export const profileApi = {
  getProfile: async (): Promise<ProfileData> => {
    const token = getAuthToken();
    const url = `${API_CONFIG.baseURL}/profile`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  updateProfile: async (formData: FormData): Promise<ProfileData> => {
    const token = getAuthToken();
    const url = `${API_CONFIG.baseURL}/profile`;
    
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

