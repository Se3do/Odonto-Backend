import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/health (GET) reports the database is up', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
        expect(res.body.info.database.status).toBe('up');
      });
  });

  it('/auth/register (POST) creates a user', async () => {
    const suffix = Date.now();
    const { body } = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        username: `e2e${suffix}`,
        email: `e2e${suffix}@t.com`,
        password: 'e2epass123',
      })
      .expect(201);

    expect(body.user.email).toBe(`e2e${suffix}@t.com`);
  });

  afterEach(async () => {
    await app.close();
  });
});
