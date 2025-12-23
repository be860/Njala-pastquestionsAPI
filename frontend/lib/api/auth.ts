import { apiRequest, apiRequestFormData } from './config';

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role?: string;
}

export interface LoginData {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface GoogleLoginData {
  credential: string;
}

export interface RequestOtpData {
  target: string;
  type?: string;
}

export interface VerifyOtpData {
  target: string;
  code: string;
  type?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    avatarUrl?: string;
    lastLogin?: string;
  };
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

export const authApi = {
  register: async (data: RegisterData): Promise<{ message: string }> => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login: async (data: LoginData): Promise<AuthResponse | { requiresTwoFactorAuth: boolean; email: string }> => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  googleLogin: async (data: GoogleLoginData): Promise<AuthResponse> => {
    return apiRequest('/auth/google-login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  requestOtp: async (data: RequestOtpData): Promise<{ message: string }> => {
    return apiRequest('/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({
        target: data.target,
        type: data.type || 'email',
      }),
    });
  },

  verifyOtp: async (data: VerifyOtpData): Promise<{ message: string }> => {
    return apiRequest('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        target: data.target,
        code: data.code,
        type: data.type || 'email',
      }),
    });
  },

  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    return apiRequest('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  requestPasswordReset: async (email: string): Promise<{ message: string }> => {
    return apiRequest('/auth/request-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (email: string, token: string, newPassword: string): Promise<{ message: string }> => {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, token, newPassword }),
    });
  },
};


