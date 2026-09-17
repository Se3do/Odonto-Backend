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

interface AnalyticsBody {
  totalCompleted?: number;
  averageScore?: number | null;
  totalXpEarned?: number;
  byPhase?: { phase?: string; count?: number }[];
}

describe('Attempts analytics (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaClient;
  let dispose: () => Promise<void>;
  let admin: AuthTokens;
  let student: AuthTokens;

  beforeAll(async () => {
    app = await createTestApp();
    const client = createPrismaClient();
    prisma = client.prisma;
    dispose = client.dispose;

    const suffix = Date.now();
    student = await registerUser(app, `an${suffix}`, `an${suffix}@e2e.test`);
    const adminCandidate = await registerUser(
      app,
      `aa${suffix}`,
      `aa${suffix}@e2e.test`,
    );
    admin = await promoteToAdmin(app, prisma, adminCandidate);
  });

  afterAll(async () => {
    await dispose();
    await app.close();
  });

  it('returns 403 for non-admins', async () => {
    await request(app.getHttpServer())
      .get('/attempts/analytics')
      .set('Authorization', `Bearer ${student.accessToken}`)
      .expect(403);
  });

  it('returns aggregated analytics for admins', async () => {
    const response = await request(app.getHttpServer())
      .get('/attempts/analytics')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);

    const body = response.body as AnalyticsBody;
    expect(typeof body.totalCompleted).toBe('number');
    expect(
      body.averageScore === null || typeof body.averageScore === 'number',
    ).toBe(true);
    expect(typeof body.totalXpEarned).toBe('number');
    expect(Array.isArray(body.byPhase)).toBe(true);
    expect(body.byPhase?.some((p) => p.phase === 'COMPLETED')).toBe(true);
  });
});
