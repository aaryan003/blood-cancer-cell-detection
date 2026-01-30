export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'DOCTOR' | 'LAB_TECH' | 'HOSPITAL';
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  data?: {
    user: User;
    token?: string;
  };
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface DiagnosisResult {
  id: string;
  result: string;
  confidence: number;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  createdAt: string;
}

export interface Report {
  id: string;
  sampleId: string;
  reportUrl: string;
  patient: Patient;
  diagnosis?: DiagnosisResult;
  createdAt: string;
}