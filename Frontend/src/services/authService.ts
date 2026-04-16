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
      console.error('Signup request failed:', error);
      return {
        success: false,
        error: 'Unable to connect to the server. Please check your connection and try again.'
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

      // Store user data for profile/layout use
      if (result.data?.user) {
        localStorage.setItem('userData', JSON.stringify(result.data.user));
      }

      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      console.error('Login request failed:', error);
      return {
        success: false,
        error: 'Unable to connect to the server. Please check your connection and try again.'
      };
    }
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('userData');
  }

  getStoredUser(): { id: string; name: string; email: string; role: string } | null {
    const data = localStorage.getItem('userData');
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();
