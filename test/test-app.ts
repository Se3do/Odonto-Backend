import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import { PrismaClient, UserRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

export interface AuthTokens {
  accessToken: string;
  userId: string;
  email: string;
}

export async function createTestApp(): Promise<INestApplication<App>> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideGuard(ThrottlerGuard)
    .useValue({ canActivate: () => true })
    .compile();

  const app = moduleFixture.createNestApplication<INestApplication<App>>();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();
  return app;
}

export function createPrismaClient(): {
  prisma: PrismaClient;
  dispose: () => Promise<void>;
} {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  return {
    prisma,
    dispose: async () => {
      await prisma.$disconnect();
      await pool.end();
    },
  };
}

export async function registerUser(
  app: INestApplication<App>,
  username: string,
  email: string,
): Promise<AuthTokens> {
  const response = await request(app.getHttpServer())
    .post('/auth/register')
    .send({ username, email, password: 'e2epass123' });

  expect(response.status).toBe(201);
  const body = response.body as {
    accessToken: string;
    user: { id: string };
  };
  return {
    accessToken: body.accessToken,
    userId: body.user.id,
    email,
  };
}

export async function promoteToAdmin(
  app: INestApplication<App>,
  prisma: PrismaClient,
  user: AuthTokens,
): Promise<AuthTokens> {
  await prisma.user.update({
    where: { Id: user.userId },
    data: { Role: UserRole.ADMIN },
  });

  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email: user.email, password: 'e2epass123' });

  expect(response.status).toBe(201);
  return {
    accessToken: (response.body as { accessToken: string }).accessToken,
    userId: user.userId,
    email: user.email,
  };
}
