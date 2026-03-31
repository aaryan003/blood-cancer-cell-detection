export const APP_CONFIG = {
  name: 'Blood Cancer Cell Detection System',
  version: '1.0.0',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
};

export const ROLES = {
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  LAB_TECH: 'LAB_TECH',
  HOSPITAL: 'HOSPITAL',
} as const;

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.DOCTOR]: 'Doctor',
  [ROLES.LAB_TECH]: 'Lab Technician',
  [ROLES.HOSPITAL]: 'Hospital Administrator',
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
    LOGOUT: '/api/auth/logout',
  },
  CAPTCHA: '/api/captcha',
  UPLOAD: '/api/upload',
  PREDICT: '/api/predict',
  DIAGNOSES: '/api/diagnoses',
  REPORTS: '/api/reports',
  METRICS: '/api/metrics',
  AUDIT_LOGS: '/api/audit-logs',
  DASHBOARD: {
    STATS: '/api/dashboard/stats',
    TRENDS: '/api/dashboard/trends',
    HOSPITALS: '/api/dashboard/hospitals',
  },
};
