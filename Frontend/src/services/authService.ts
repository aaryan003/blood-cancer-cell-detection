import { APP_CONFIG, API_ENDPOINTS } from '../constants';
import type { SignupData, LoginData, AuthResponse, Captcha } from '../types';

class AuthService {
  async fetchCaptcha(): Promise<Captcha | null> {
    try {
      const response = await fetch(`${APP_CONFIG.apiUrl}${API_ENDPOINTS.CAPTCHA}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error('CAPTCHA fetch failed:', response.status, response.statusText);
        return null;
      }
      
      const result = await response.json();
      
      if (result.success && result.captcha) {
        return result.captcha;
      }
      
      console.error('Invalid CAPTCHA response:', result);
      return null;
    } catch (error) {
      console.error('Failed to fetch CAPTCHA:', error);
      return null;
    }
  }
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
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }
}

export const authService = new AuthService();