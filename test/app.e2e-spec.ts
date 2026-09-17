import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './test-app';

interface HealthResponse {
  status: string;
  info?: { database?: { status: string } };
}

interface RegisterResponse {
  user?: { email?: string };
}

describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/health (GET) reports the database is up', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        const body = res.body as HealthResponse;
        expect(body.status).toBe('ok');
        expect(body.info?.database?.status).toBe('up');
      });
  });

  it('/auth/register (POST) creates a user', async () => {
    const suffix = Date.now();
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        username: `e2e${suffix}`,
        email: `e2e${suffix}@t.com`,
        password: 'e2epass123',
      });

    expect(response.status).toBe(201);
    expect((response.body as RegisterResponse).user?.email).toBe(
      `e2e${suffix}@t.com`,
    );
  });
});
