import { INestApplication } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import type { UploadStream } from 'cloudinary';
import request from 'supertest';
import { App } from 'supertest/types';
import { AuthTokens, createTestApp, registerUser } from './test-app';

interface UserBody {
  avatarUrl?: string | null;
}

const MOCK_AVATAR_URL = 'https://res.cloudinary.com/test/image/upload/a.png';

describe('Avatar upload (e2e)', () => {
  let app: INestApplication<App>;
  let user: AuthTokens;

  beforeAll(async () => {
    process.env.CLOUDINARY_URL = 'cloudinary://key:secret@test-cloud';
    jest
      .spyOn(cloudinary.uploader, 'upload_stream')
      .mockImplementation(
        (
          _options: unknown,
          callback: (error?: unknown, result?: { secure_url: string }) => void,
        ) => {
          const stream = {
            end: () => {
              callback(undefined, { secure_url: MOCK_AVATAR_URL });
            },
          };
          return stream as unknown as UploadStream;
        },
      );

    app = await createTestApp();
    const suffix = Date.now();
    user = await registerUser(app, `av${suffix}`, `av${suffix}@e2e.test`);
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    await app.close();
  });

  it('uploads an avatar and exposes it on the profile', async () => {
    const png = Buffer.from('fake-png-content');
    const upload = await request(app.getHttpServer())
      .post('/users/avatar')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .attach('file', png, {
        filename: 'avatar.png',
        contentType: 'image/png',
      })
      .expect(201);

    expect((upload.body as { avatarUrl?: string }).avatarUrl).toBe(
      MOCK_AVATAR_URL,
    );

    const profile = await request(app.getHttpServer())
      .get('/users/profile')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(200);

    expect((profile.body as UserBody).avatarUrl).toBe(MOCK_AVATAR_URL);
  });

  it('rejects non-image files with 400', async () => {
    await request(app.getHttpServer())
      .post('/users/avatar')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .attach('file', Buffer.from('not an image'), {
        filename: 'avatar.txt',
        contentType: 'text/plain',
      })
      .expect(400);
  });

  it('rejects missing files with 400', async () => {
    await request(app.getHttpServer())
      .post('/users/avatar')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(400);
  });
});
