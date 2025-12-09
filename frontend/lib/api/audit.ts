import { apiRequest } from './config';

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  userId?: string;
  timestamp: string;
}

export const auditApi = {
  getAllLogs: async (): Promise<AuditLog[]> => {
    return apiRequest('/audit/logs');
  },
};

