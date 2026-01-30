import { AuthService } from './auth.service.js';

export class AuthController {
  static async signup(req, res) {
    try {
      const { name, email, password, role } = req.body;

      // Comprehensive validation
      const errors = [];

      // Name validation
      if (!name || !name.trim()) {
        errors.push('Full name is required');
      } else if (name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
      } else if (name.trim().length > 100) {
        errors.push('Name must be less than 100 characters');
      } else if (!/^[a-zA-Z\s.'-]+$/.test(name.trim())) {
        errors.push('Name can only contain letters, spaces, dots, hyphens and apostrophes');
      }

      // Email validation
      if (!email || !email.trim()) {
        errors.push('Email address is required');
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          errors.push('Invalid email format');
        } else if (email.trim().length > 255) {
          errors.push('Email must be less than 255 characters');
        }
      }

      // Password validation
      if (!password) {
        errors.push('Password is required');
      } else if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
      } else if (password.length > 128) {
        errors.push('Password must be less than 128 characters');
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        errors.push('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      }

      // Role validation
      const validRoles = ['ADMIN', 'DOCTOR', 'LAB_TECH', 'HOSPITAL'];
      if (!role) {
        errors.push('Role is required');
      } else if (!validRoles.includes(role)) {
        errors.push('Invalid role. Must be one of: ' + validRoles.join(', '));
      }

      // Return validation errors
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: errors[0], // Return first error for better UX
          errors: errors
        });
      }

      // Create user
      const user = await AuthService.signup({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role
      });

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: { user }
      });
    } catch (error) {
      console.error('Signup error:', error);
      
      // Handle specific database errors
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists'
        });
      }
      
      if (error.message === 'User with this email already exists') {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      // Handle database connection errors
      if (error.code === 'P1001') {
        return res.status(503).json({
          success: false,
          message: 'Database connection failed. Please try again later.'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error. Please try again later.'
      });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Basic validation
      if (!email || !email.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Email address is required'
        });
      }

      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Password is required'
        });
      }

      // Email format validation
      const cleanEmail = email.trim().replace(/^mailto:/, '');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      // Authenticate user
      const user = await AuthService.login({
        email: cleanEmail.toLowerCase(),
        password
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: { user }
      });
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.message === 'Invalid email or password') {
        return res.status(401).json({
          success: false,
          message: error.message
        });
      }

      // Handle database connection errors
      if (error.code === 'P1001') {
        return res.status(503).json({
          success: false,
          message: 'Database connection failed. Please try again later.'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error. Please try again later.'
      });
    }
  }
}