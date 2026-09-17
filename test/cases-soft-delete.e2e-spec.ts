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

interface CaseListBody {
  data?: { id?: string }[];
}

const DIAGNOSIS_ID = '33333333-3333-3333-3333-333333333331';
const SPECIALTY_ID = '22222222-2222-2222-2222-222222222221';
const TEST_ID = '44444444-4444-4444-4444-444444444441';
const TREATMENT_ID = '55555555-5555-5555-5555-555555555551';

describe('Case soft delete (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaClient;
  let dispose: () => Promise<void>;
  let admin: AuthTokens;
  let student: AuthTokens;
  let caseId: string;

  beforeAll(async () => {
    app = await createTestApp();
    const client = createPrismaClient();
    prisma = client.prisma;
    dispose = client.dispose;

    const suffix = Date.now();
    student = await registerUser(app, `cs${suffix}`, `cs${suffix}@e2e.test`);
    const adminCandidate = await registerUser(
      app,
      `ca${suffix}`,
      `ca${suffix}@e2e.test`,
    );
    admin = await promoteToAdmin(app, prisma, adminCandidate);
  });

  afterAll(async () => {
    await dispose();
    await app.close();
  });

  it('creates a case as admin', async () => {
    const response = await request(app.getHttpServer())
      .post('/cases')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send({
        title: `Soft Delete Case ${Date.now()}`,
        patientHistory:
          'Patient reports sharp pain on percussion lasting several minutes after a hot or cold stimulus.',
        diagnosisExplanation:
          'Findings are consistent with an irreversible pulpitis requiring root canal therapy.',
        difficulty: 'EASY',
        diagnosisId: DIAGNOSIS_ID,
        specialtyId: SPECIALTY_ID,
        tests: [{ id: TEST_ID, isCorrect: true }],
        treatments: [{ id: TREATMENT_ID, isCorrect: true }],
      })
      .expect(201);

    caseId = (response.body as { id: string }).id;
    expect(caseId).toBeTruthy();
  });

  it('blocks non-admin case deletion with 403', async () => {
    await request(app.getHttpServer())
      .delete(`/cases/${caseId}`)
      .set('Authorization', `Bearer ${student.accessToken}`)
      .expect(403);
  });

  it('soft deletes the case as admin', async () => {
    await request(app.getHttpServer())
      .delete(`/cases/${caseId}`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);
  });

  it('returns 404 for the deleted case', async () => {
    await request(app.getHttpServer())
      .get(`/cases/${caseId}`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(404);
  });

  it('excludes the deleted case from the case list', async () => {
    const response = await request(app.getHttpServer())
      .get('/cases?page=1&limit=100')
      .set('Authorization', `Bearer ${student.accessToken}`)
      .expect(200);

    const body = response.body as CaseListBody;
    expect(body.data?.some((c) => c.id === caseId)).toBe(false);
  });
});
