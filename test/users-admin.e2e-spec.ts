import { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { App } from 'supertest/types';
import {
  AuthTokens,
  createPrismaClient,
  createTestApp,
  promoteToAdmin,
  registerUser,
} from './test-app';

interface UserListBody {
  items?: { id?: string; username?: string; role?: string }[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  search?: string;
}

interface UserBody {
  id?: string;
  role?: string;
}

describe('Users admin endpoints (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaClient;
  let dispose: () => Promise<void>;
  let admin: AuthTokens;
  let student: AuthTokens;
  let victim: AuthTokens;
  let promotee: AuthTokens;

  beforeAll(async () => {
    app = await createTestApp();
    const client = createPrismaClient();
    prisma = client.prisma;
    dispose = client.dispose;

    const suffix = Date.now();
    student = await registerUser(app, `s${suffix}`, `s${suffix}@e2e.test`);
    promotee = await registerUser(app, `p${suffix}`, `p${suffix}@e2e.test`);
    victim = await registerUser(app, `v${suffix}`, `v${suffix}@e2e.test`);

    const adminCandidate = await registerUser(
      app,
      `a${suffix}`,
      `a${suffix}@e2e.test`,
    );
    admin = await promoteToAdmin(app, prisma, adminCandidate);
  });

  afterAll(async () => {
    await dispose();
    await app.close();
  });

  it('rejects non-admins with 403 on user list', async () => {
    await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${student.accessToken}`)
      .expect(403);
  });

  it('rejects non-admins with 403 on role changes and deletes', async () => {
    await request(app.getHttpServer())
      .patch(`/users/${promotee.userId}/role`)
      .set('Authorization', `Bearer ${student.accessToken}`)
      .send({ role: 'ADMIN' })
      .expect(403);

    await request(app.getHttpServer())
      .delete(`/users/${victim.userId}`)
      .set('Authorization', `Bearer ${student.accessToken}`)
      .expect(403);
  });

  it('lists users with pagination metadata as admin', async () => {
    const response = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);

    const body = response.body as UserListBody;
    expect(Array.isArray(body.items)).toBe(true);
    expect(typeof body.total).toBe('number');
    expect(typeof body.page).toBe('number');
    expect(typeof body.limit).toBe('number');
    expect(typeof body.totalPages).toBe('number');
    expect(typeof body.search).toBe('string');
  });

  it('filters users by search as admin', async () => {
    const response = await request(app.getHttpServer())
      .get(`/users?search=${promotee.email}`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);

    const body = response.body as UserListBody;
    expect(body.items?.some((u) => u.id === promotee.userId)).toBe(true);
  });

  it('promotes another user to admin', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/users/${promotee.userId}/role`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ role: 'ADMIN' })
      .expect(200);

    expect((response.body as UserBody).role).toBe('ADMIN');
  });

  it('forbids demoting yourself', async () => {
    await request(app.getHttpServer())
      .patch(`/users/${admin.userId}/role`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({ role: 'USER' })
      .expect(403);
  });

  it('forbids deleting your own account', async () => {
    await request(app.getHttpServer())
      .delete(`/users/${admin.userId}`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(400);
  });

  it('soft deletes another user, hides them from lists and blocks login', async () => {
    await request(app.getHttpServer())
      .delete(`/users/${victim.userId}`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);

    const list = await request(app.getHttpServer())
      .get(`/users?search=${victim.email}`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);

    const body = list.body as UserListBody;
    expect(body.items?.some((u) => u.id === victim.userId)).toBe(false);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: victim.email, password: 'e2epass123' })
      .expect(401);
  });
});
