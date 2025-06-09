import request from 'supertest';
import { PrismaClient, Role } from '@prisma/client';
import app from '../src/index';

const prisma = new PrismaClient();

describe('User Routes Integration', () => {
  // Generate unique test data
  const testId = `test-${Date.now()}`;
  const testEmail = `test-${Date.now()}@example.com`;
  const payload = {
    id: testId,
    email: testEmail,
    password: 'password123',
    name: 'Test User',
    role: Role.student,
  };

  it('should CREATE a new user and then DELETE it', async () => {
    // Create user
    const createRes = await request(app)
      .post('/api/user')
      .send(payload)
      .set('Content-Type', 'application/json');

    expect(createRes.status).toBe(201);
    expect(createRes.body).toMatchObject({
      id: testId,
      email: testEmail,
      name: 'Test User',
      role: Role.student,
    });

    // Clean up: delete the created user
    const deleteRes = await request(app)
      .delete(`/api/user/${testId}`);

    expect(deleteRes.status).toBe(204);
  });

  it('should GET users by role', async () => {
    // Seed another user
    const seedPayload = { ...payload, id: `${testId}-2`, email: `2-${testEmail}` };
    await prisma.user.create({ data: seedPayload });

    const res = await request(app).get(`/api/user/role/${payload.role}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Should contain at least the seeded user
    expect(res.body.some((u: any) => u.id === seedPayload.id)).toBe(true);

    // Clean up seed
    await prisma.user.delete({ where: { id: seedPayload.id } });
  });

  it('should UPDATE a user and then DELETE it', async () => {
    // Create user to update
    const createRes = await request(app)
      .post('/api/user')
      .send(payload)
      .set('Content-Type', 'application/json');

    expect(createRes.status).toBe(201);

    // Update user data
    const updatedPayload = {
      id: testId,
      email: testEmail,
      password: 'password123',
      name: 'Updated User',
      role: Role.instructor,
    };
    const updateRes = await request(app)
      .put(`/api/user/${testId}`)
      .send(updatedPayload)
      .set('Content-Type', 'application/json');

    expect(updateRes.status).toBe(200);
    expect(updateRes.body).toMatchObject({
      id: testId,
      email: testEmail,
      name: 'Updated User',
      role: Role.instructor,
    });

    // Clean up: delete the updated user
    const deleteRes = await request(app)
      .delete(`/api/user/${testId}`);

    expect(deleteRes.status).toBe(204);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});