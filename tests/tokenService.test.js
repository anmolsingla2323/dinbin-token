import request from 'supertest';
import express from 'express';
import routes from '../src/routes.js';
import { describe, test, expect, afterAll } from '@jest/globals';
import prisma from '../src/db.js';

afterAll(async () => {
  await prisma.$disconnect();
});

const app = express();
app.use(express.json());
app.use('/api/token', routes);

let generatedToken;
let testUserId = 'user-123';
let testDeviceId = 'device-abc';
let testFingerprint = 'chrome';

describe('Token Service API', () => {

  test('POST /generate - should create a token', async () => {
    const res = await request(app)
      .post('/api/token/generate')
      .send({ userId: testUserId, deviceId: testDeviceId, fingerprint: testFingerprint });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('sessionId');
    generatedToken = res.body.token;
  });

  test('POST /verify - should verify a valid token', async () => {
    const res = await request(app)
      .post('/api/token/verify')
      .send({ token: generatedToken });

    expect(res.statusCode).toBe(200);
    expect(res.body.valid).toBe(true);
    expect(res.body.payload.userId).toBe(testUserId);
    expect(res.body.payload).toHaveProperty('sessionId');
  });

  test('GET /sessions/:userId - should list sessions', async () => {
    const res = await request(app).get(`/api/token/sessions/${testUserId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('token');
    expect(res.body[0].userId).toBe(testUserId);
  });

  test('POST /revoke - should revoke a token', async () => {
    const res = await request(app)
      .post('/api/token/revoke')
      .send({ token: generatedToken });

    expect(res.statusCode).toBe(200);
    expect(res.body.revoked).toBe(true);
  });

  test('POST /verify - revoked token should fail', async () => {
    const res = await request(app)
      .post('/api/token/verify')
      .send({ token: generatedToken });

    expect(res.statusCode).toBe(401);
    expect(res.body.valid).toBe(false);
  });

});
