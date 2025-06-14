import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const SESSION_EXPIRE_TIME = process.env.JWT_EXPIRES_IN ?? '3600';
console.log("cek session expire time", SESSION_EXPIRE_TIME)

/**
 * Create a new user
 */
export const createUser = async (req: Request, res: Response) => {
  console.log("cek masuk createUser", req.body)
  try {
    const { email, password, name, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    
    console.log("cek hashed", hashed)
    const user = await prisma.user.create({
      data: { email, password: hashed, name, role },
    });

    res.status(201).json(user);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

/**
 * POST /login
 * Body: { email, password }
 * Response: { token } on success, or 400/401 + { message } on failure
 */
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: 'Email and password required' });
    throw new Error('Email and password required');
  }

  try {
    // 1) find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials - 1' });
      throw new Error('Invalid credentials');
    }

    // 2) compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ message: 'Invalid credentials - 2' });
      throw new Error('Invalid credentials');
    }

    // 3) sign JWT
    const payload = { sub: user.id, role: user.role, email: user.email };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET as string,
      { expiresIn: parseInt(SESSION_EXPIRE_TIME) } // Token expires in 1 hour
    );

    // 4) return token
    res.status(200).json({ token, message: 'Login successful' });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Update an existing user by ID
 */
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { email, password, name, role } = req.body;
    const user = await prisma.user.update({
      where: { id },
      data: { email, password, name, role },
    });
    res.json(user);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

/**
 * Delete a user by ID
 */
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

/**
 * Get a single user by email
 */
export const getUserByEmail = async (req: Request, res: Response) => {
  const { email } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

/**
 * Get all users with a specific role
 */
export const getUsersByRole = async (req: Request, res: Response) => {
  const { role } = req.params;
  if (![Role.admin, Role.student, Role.instructor].includes(role as Role)) {
    res.status(400).json({ error: 'Invalid role parameter' });
  }
  try {
    const users = await prisma.user.findMany({ omit: {password: true}, where: { role: role as Role } });
    res.json(users);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users by role' });
  }
};

/**
 * Get all users
 */
export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};
