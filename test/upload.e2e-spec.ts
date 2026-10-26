import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { adminToken, createApp, UploadService } from './helpers';

describe('POST /upload (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Real UploadService without S3: uses its local fallback and returns the generated name.
    jest.spyOn(UploadService.prototype, 'onModuleInit').mockResolvedValue(undefined);
    app = await createApp({});
  });
  afterAll(async () => {
    await app.close();
  });

  const upload = (size: number) =>
    request(app.getHttpServer())
      .post('/upload')
      .set('Authorization', `Bearer ${adminToken()}`)
      .attach('file', Buffer.alloc(size), { filename: 'a.png', contentType: 'image/png' });

  it('AC-17: without name -> /uploads/<uuid>.png', async () => {
    const res = await upload(10).expect(201);
    expect(res.body.url).toMatch(/^\/uploads\/[0-9a-f-]{36}\.png$/);
  });

  it('two uploads without name get different names', async () => {
    const a = await upload(10);
    const b = await upload(10);
    expect(a.body.url).not.toBe(b.body.url);
  });

  it('file just under 10 MB (10 MB - 1 byte) -> 201', async () => {
    await upload(10 * 1024 * 1024 - 1).expect(201);
  });

  it('file over 10 MB -> 413', async () => {
    await upload(10 * 1024 * 1024 + 1).expect(413);
  });
});
