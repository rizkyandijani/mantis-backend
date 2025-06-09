import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Create a new user
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const { id, email, password, name, role } = req.body;
    const user = await prisma.user.create({
      data: { id, email, password, name, role },
    });
    res.status(201).json(user);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create user' });
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
  if (!['admin', 'student', 'instructor'].includes(role)) {
    res.status(400).json({ error: 'Invalid role parameter' });
  }
  try {
    const users = await prisma.user.findMany({ where: { role: role as Role } });
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
