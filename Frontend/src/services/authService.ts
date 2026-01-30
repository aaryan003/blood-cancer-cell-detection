import { APP_CONFIG, API_ENDPOINTS } from '../constants';
import type { SignupData, LoginData, AuthResponse } from '../types';

class AuthService {
  async signup(data: SignupData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${APP_CONFIG.apiUrl}${API_ENDPOINTS.AUTH.SIGNUP}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.message || 'Failed to create account'
        };
      }

      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      console.warn('Backend not available, using mock response:', error);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation - check if email already exists in localStorage
      const existingUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
      const emailExists = existingUsers.some((user: any) => user.email === data.email);
      
      if (emailExists) {
        return {
          success: false,
          error: 'An account with this email already exists'
        };
      }
      
      // Store user in localStorage as mock database
      const newUser = {
        id: Date.now().toString(),
        name: data.name,
        email: data.email,
        role: data.role,
        createdAt: new Date().toISOString()
      };
      existingUsers.push({ ...newUser, password: data.password }); // Store password for mock login
      localStorage.setItem('mockUsers', JSON.stringify(existingUsers));
      
      return {
        success: true,
        data: { user: newUser }
      };
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${APP_CONFIG.apiUrl}${API_ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.message || 'Invalid email or password'
        };
      }

      // Store auth token if provided
      if (result.data?.token) {
        localStorage.setItem('authToken', result.data.token);
      }

      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      console.warn('Backend not available, using mock response:', error);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock login - check credentials in localStorage
      const existingUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
      const user = existingUsers.find((u: any) => 
        u.email === data.email && u.password === data.password
      );
      
      if (!user) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }
      
      // Store mock auth token
      localStorage.setItem('authToken', 'mock-token-' + user.id);
      
      return {
        success: true,
        data: { 
          user: { 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            role: user.role 
          } 
        }
      };
    }
  }

  logout() {
    localStorage.removeItem('authToken');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }
}

export const authService = new AuthService();