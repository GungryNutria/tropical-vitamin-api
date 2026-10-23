import { generateKeyPairSync } from 'crypto';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import request from 'supertest';
import { setTestEnv } from './test-env';

setTestEnv();
// Required after setTestEnv(): ConfigModule validates process.env on load.
/* eslint-disable @typescript-eslint/no-require-imports */
const { AppModule } = require('../src/app.module');
const { PrismaService } = require('../src/prisma/prisma.service');
const { UploadService } = require('../src/upload/upload.service');

const SECRET = process.env.JWT_SECRET as string;
const sign = (opts: jwt.SignOptions = {}, secret = SECRET) =>
  jwt.sign({ sub: 1, email: 'admin@example.com' }, secret, {
    algorithm: 'HS256',
    expiresIn: '1h',
    ...opts,
  });

const rsa = generateKeyPairSync('rsa', { modulusLength: 2048 });
const tokens: Record<string, string | undefined> = {
  missing: undefined,
  expired: sign({ expiresIn: -10 }),
  tampered: sign({}, 'another-secret-another-secret-123456'),
  auth0Rs256: jwt.sign({ sub: 'auth0|abc' }, rsa.privateKey, {
    algorithm: 'RS256',
    expiresIn: '1h',
  }),
  garbage: 'not-a-jwt',
};

const prismaMock = () => {
  const model = new Proxy(
    {},
    {
      get: (_t, method) => async () =>
        method === 'findMany' ? [] : { id: 1, translations: [] },
    },
  );
  return new Proxy(
    {},
    {
      get: (_t, name) => {
        if (name === 'then') return undefined;
        if (name === 'user') {
          return {
            findUnique: async () => ({
              id: 1,
              email: 'admin@example.com',
              name: 'Admin',
              isActive: true,
              password: bcrypt.hashSync('right-password', 4),
            }),
          };
        }
        if (typeof name === 'string' && name.startsWith('$')) {
          return async () => undefined;
        }
        return model;
      },
    },
  );
};

async function createApp() {
  const mod = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PrismaService)
    .useValue(prismaMock())
    .overrideProvider(MailerService)
    .useValue({ sendMail: jest.fn().mockResolvedValue({}) })
    .overrideProvider(UploadService)
    .useValue({ saveFile: async () => 'https://s3.example.com/x.png' })
    .compile();
  const app = mod.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false, transform: true }),
  );
  await app.init();
  return app as INestApplication;
}

const writes: Array<[string, string, object]> = [
  ['post', '/tours', { price: 1, location: 'x', translations: [] }],
  ['patch', '/tours/1', { price: 2 }],
  ['delete', '/tours/1', {}],
  ['post', '/categories', { adminName: 'a', description: 'b' }],
  ['patch', '/categories/1', { description: 'b' }],
  ['delete', '/categories/1', {}],
  ['post', '/categories/1/translations', { languageId: 1, name: 'n', description: 'd' }],
  ['patch', '/categories/1/translations/1', { name: 'n' }],
  ['delete', '/categories/1/translations/1', {}],
  ['post', '/languages', { code: 'fr', name: 'Francais' }],
  ['patch', '/languages/1', { name: 'x' }],
  ['delete', '/languages/1', {}],
];

const mailBody = { name: 'A', email: 'a@example.com', phone: '1', message: 'hola' };
const png = { filename: 'a.png', contentType: 'image/png' };

describe('Admin guard and public routes (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    app = await createApp();
  });
  afterAll(async () => {
    await app.close();
  });

  const call = (method: string, url: string, token?: string) => {
    const req = (request(app.getHttpServer()) as any)[method](url);
    return token ? req.set('Authorization', `Bearer ${token}`) : req;
  };

  describe.each(Object.entries(tokens))('AC-22: token %s', (_label, token) => {
    it.each(writes)('%s %s -> 401', async (method, url, body) => {
      await call(method, url, token).send(body).expect(401);
    });
    it('POST /upload -> 401', async () => {
      await call('post', '/upload', token).attach('file', Buffer.from('x'), png).expect(401);
    });
  });

  describe('AC-22: valid admin token', () => {
    it.each(writes)('%s %s passes the guard', async (method, url, body) => {
      const res = await call(method, url, sign()).send(body);
      expect([200, 201]).toContain(res.status);
    });
    it('POST /upload -> 201', async () => {
      await call('post', '/upload', sign()).attach('file', Buffer.from('x'), png).expect(201);
    });
  });

  describe('AC-23: public routes without token', () => {
    it.each(['/tours?lang=es', '/tours/all', '/tours/1', '/categories', '/languages'])(
      'GET %s',
      async (url) => {
        await call('get', url).expect(200);
      },
    );
    it('POST /mail -> 201', async () => {
      await call('post', '/mail').send(mailBody).expect(201);
    });
  });

  describe('REQ-39: validation', () => {
    it('POST /mail with invalid email -> 400 naming the field', async () => {
      const res = await call('post', '/mail').send({ ...mailBody, email: 'nope' }).expect(400);
      expect(JSON.stringify(res.body.message)).toContain('email');
    });
    it('POST /auth/login with invalid body -> 400', async () => {
      await call('post', '/auth/login').send({ email: 'nope' }).expect(400);
    });
    it('POST /categories with empty body -> 400', async () => {
      await call('post', '/categories', sign()).send({}).expect(400);
    });
    it('POST /languages with bad isActive -> 400', async () => {
      await call('post', '/languages', sign()).send({ code: 'x', name: 'y', isActive: 'si' }).expect(400);
    });
  });

  describe('login', () => {
    it('issues a token the guard accepts', async () => {
      const res = await call('post', '/auth/login')
        .send({ email: 'admin@example.com', password: 'right-password' })
        .expect(201);
      await call('delete', '/languages/1', res.body.access_token).expect(200);
    });
    it('wrong password -> 401', async () => {
      await call('post', '/auth/login')
        .send({ email: 'admin@example.com', password: 'bad' })
        .expect(401);
    });
  });
});

describe('POST /mail rate limit (RNF-4)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    app = await createApp();
  });
  afterAll(async () => {
    await app.close();
  });

  it('4th request within a minute -> 429', async () => {
    const send = () => request(app.getHttpServer()).post('/mail').send(mailBody);
    for (let i = 0; i < 3; i++) await send().expect(201);
    await send().expect(429);
  });
});
