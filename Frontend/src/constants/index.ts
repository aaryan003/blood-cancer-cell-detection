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
  UPLOAD: '/api/upload',
  DIAGNOSIS: '/api/diagnosis',
  REPORTS: '/api/reports',
  METRICS: '/api/metrics',
  AUDIT: '/api/audit',
};