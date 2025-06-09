import request from 'supertest';
import { PrismaClient, Role } from '@prisma/client';
import app from '../src/index';
import { MachineType } from '@prisma/client';

const testMachineId = 'machine-123';
const testMachineType = MachineType.BUBUT;

const prisma = new PrismaClient();

describe('Machine Route Tests', () => {
  const machinePayload = {
    name: 'Test Machine',
    type: testMachineType,
    section: 'Bubut Dasar',
    unit: 'WBS'
  };

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should CREATE a new machine and then DELETE it', async () => {
    // Create machine
    const createRes = await request(app)
      .post('/api/machine')
      .send(machinePayload)
      .set('Content-Type', 'application/json');

    expect(createRes.status).toBe(201);
    expect(createRes.body).toMatchObject({
      name: 'Test Machine',
      type: testMachineType,
      section: 'Bubut Dasar',
      unit: 'WBS'
    });


    // Clean up: delete the created machine
    const deleteRes = await request(app)
      .delete(`/api/machine/${createRes.body.id}`);
    expect(deleteRes.status).toBe(204);
    await prisma.machine.deleteMany({where: {name: { contains: 'Test Machine' } }});
  });

  it('should UPDATE a machine', async () => {
    const createRes = await prisma.machine.create({data: machinePayload});

    const updatedPayload = {
      name: 'Updated Machine Name',
      unit: 'WAD'
    };
  
    // Update machine
    const updateRes = await request(app)
      .put(`/api/machine/${createRes.id}`)
      .send(updatedPayload)
      .set('Content-Type', 'application/json');
  
    expect(updateRes.status).toBe(200);
    expect(updateRes.body).toMatchObject({
      name: 'Updated Machine Name',
      unit: 'WAD',
      section: 'Bubut Dasar',
      type: testMachineType
    });
  
    // Verify update in database
    const machineInDb = await request(app).get(`/api/machine/${updateRes.body.id}`);
    expect(machineInDb.body).toMatchObject({
      name: 'Updated Machine Name',
      unit: 'WAD',
    });

    // Clean up: delete the created machine
    await prisma.machine.delete({where: {id: createRes.id}});
    await prisma.machine.deleteMany({where: {name: { contains: 'Updated Machine Name' } }});
  });

  it('should GET machines by type', async () => {
    // Seed another machine
    const seedPayload = { ...machinePayload, name: 'Seed Machine' };
    const createRes = await request(app)
    .post('/api/machine')
    .send(seedPayload)
    .set('Content-Type', 'application/json');

    expect(createRes.status).toBe(201);

    const res = await request(app).get(`/api/machine/type/${machinePayload.type}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Should contain at least the seeded machine
    console.log("cek res body", res.body)
    expect(res.body.some((m: any) => m.name === seedPayload.name)).toBe(true);

        // Clean up: delete the created machine
    const deleteRes = await request(app)
        .delete(`/api/machine/${createRes.body.id}`);
    expect(deleteRes.status).toBe(204);
    await prisma.machine.deleteMany({where: {name: { contains: 'Seed Machine' } }});
  });
});