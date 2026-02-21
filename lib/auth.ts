import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'admin';
}

export interface TokenPayload extends User {
  exp?: number;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate JWT token
export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: process.env.SESSION_DURATION || '7d' }
  );
}

// Verify JWT token
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

// Extract user from request
export function getUserFromRequest(request: NextRequest): TokenPayload | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return verifyToken(token);
}

// Middleware to require authentication
export function requireAuth(request: NextRequest): TokenPayload {
  const user = getUserFromRequest(request);
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}

// Middleware to require admin role
export function requireAdmin(request: NextRequest): TokenPayload {
  const user = requireAuth(request);
  
  if (user.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }
  
  return user;
}
