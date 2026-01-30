import prisma from '../config/prisma.js';

export class UserModel {
  static async create(userData) {
    try {
      const user = await prisma.user.create({
        data: userData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      });
      return user;
    } catch (error) {
      console.error('UserModel create error:', error);
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
          role: true,
          createdAt: true
        }
      });
      return user;
    } catch (error) {
      console.error('UserModel findByEmail error:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      });
      return user;
    } catch (error) {
      console.error('UserModel findById error:', error);
      throw error;
    }
  }

  static async count() {
    try {
      return await prisma.user.count();
    } catch (error) {
      console.error('UserModel count error:', error);
      throw error;
    }
  }
}