import bcrypt from 'bcryptjs';
import { UserModel } from '../../models/User.model.js';

export class AuthService {
  static async signup(userData) {
    const { name, email, password, role } = userData;

    try {
      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const newUser = await UserModel.create({
        name,
        email,
        password: hashedPassword,
        role
      });

      return newUser;
    } catch (error) {
      console.error('AuthService signup error:', error);
      throw error;
    }
  }

  static async login(loginData) {
    const { email, password } = loginData;

    try {
      // Clean email by removing any potential mailto: prefix
      const cleanEmail = email.replace(/^mailto:/, '').toLowerCase();
      
      // Find user by email
      const user = await UserModel.findByEmail(cleanEmail);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('AuthService login error:', error);
      throw error;
    }
  }
}