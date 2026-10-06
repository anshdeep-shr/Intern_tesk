import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../db/prisma';
import { AuthRequest } from '../middleware/auth';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters long'),
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters long')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required')
});

const generateToken = (userId: string, email: string): string => {
  const secret = process.env.JWT_SECRET || 'super-secret-jwt-key-for-project-management-system';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id: userId, email }, secret, { expiresIn: expiresIn as any });
};

export const register = async (req: Request, res: Response) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: parseResult.error.errors.map(err => ({ field: err.path.join('.'), message: err.message }))
      });
    }

    const { fullName, email, password } = parseResult.data;
    const lowerEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({ where: { email: lowerEmail } });
    if (existingUser) {
      return res.status(400).json({
        error: 'Conflict',
        message: 'An account with this email address already exists.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        fullName,
        email: lowerEmail,
        password: hashedPassword
      }
    });

    const token = generateToken(user.id, user.email);

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error: any) {
    console.error('Register Error:', error);
    return res.status(500).json({ error: 'Server Error', message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: parseResult.error.errors.map(err => ({ field: err.path.join('.'), message: err.message }))
      });
    }

    const { email, password } = parseResult.data;
    const lowerEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email: lowerEmail } });
    if (!user) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid email or password.'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user.id, user.email);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error: any) {
    console.error('Login Error:', error);
    return res.status(500).json({ error: 'Server Error', message: error.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  return res.status(200).json({
    message: 'Logged out successfully'
  });
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'User context not found' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Not Found', message: 'User profile not found' });
    }

    return res.status(200).json({ user });
  } catch (error: any) {
    console.error('getMe Error:', error);
    return res.status(500).json({ error: 'Server Error', message: error.message });
  }
};
