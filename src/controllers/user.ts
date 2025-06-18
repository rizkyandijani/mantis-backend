import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CodeError } from '../libs/code_error';

const prisma = new PrismaClient();
const SESSION_EXPIRE_TIME = process.env.JWT_EXPIRES_IN ?? '3600';
console.log("cek session expire time", SESSION_EXPIRE_TIME)

/**
 * Create a new user
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: { email, password: hashed, name, role },
    });

    res.status(201).json(user);
  } catch (error: any) {
    throw {actualError: error, fallBackMessage: 'Failed to create user', fallBackCode: 500};
    // res.status(500).json({ error: 'Failed to create user' });
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
    throw new CodeError('Email and password required', 400);
  }

  try {
    // 1) find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new CodeError('Invalid credential-1', 401);
    }

    // 2) compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new CodeError('Invalid credentials-2', 401);
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
  } catch (error: unknown) {
    throw {actualError: error, fallBackMessage: 'Failed to login', fallBackCode: 500};
    // res.status(500).json({ message: 'Internal server error' });
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
    throw {actualError: error, fallBackMessage: 'Failed to update user', fallBackCode: 500};
    // res.status(500).json({ error: 'Failed to update user' });
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
    throw {actualError: error, fallBackMessage: 'Failed to delete user', fallBackCode: 500};
    // res.status(500).json({ error: 'Failed to delete user' });
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
      throw new CodeError('User not found', 404);
    }
    res.json(user);
  } catch (error: any) {
    throw {actualError: error, fallBackMessage: 'Failed to fetch user', fallBackCode: 500};
    // res.status(500).json({ error: 'Failed to fetch user' });
  }
};

/**
 * Get all users with a specific role
 */
export const getUsersByRole = async (req: Request, res: Response) => {
  const { role } = req.params;
  if (![Role.admin, Role.student, Role.instructor].includes(role as Role)) {
    throw new CodeError('Invalid role parameter', 400)
  }
  try {
    const users = await prisma.user.findMany({ omit: {password: true}, where: { role: role as Role } });
    res.json(users);
  } catch (error: any) {
    throw {actualError: error, fallBackMessage: 'Failed to fetch users by Role', fallBackCode: 500};
    // res.status(500).json({ error: 'Failed to fetch users by role' });
  }
};

/**
 * Get all users with a instructor role
 */
export const getInstructors = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({ omit: {password: true}, where: { role: Role.instructor } });
    res.json(users);
  } catch (error: any) {
    throw {actualError: error, fallBackMessage: 'Failed to fetch instructors', fallBackCode: 500};
    // res.status(500).json({ error: 'Failed to fetch users by role' });
  }
};

export const getUserByUserId = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const user = await prisma.user.findUnique({where: {
      id: userId
    }});
    if(!user){
      throw new CodeError('User is not found.', 404)
    }
    res.json(user);
  } catch (error: any) {
    throw {actualError: error, fallBackMessage: 'Failed to fetch users by Role', fallBackCode: 500};
    // res.status(500).json({ error: 'Failed to fetch users by role' });
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
    throw {actualError: error, fallBackMessage: 'Failed to fetch users', fallBackCode: 500};
    // res.status(500).json({ error: 'Failed to fetch users' });
  }
};
