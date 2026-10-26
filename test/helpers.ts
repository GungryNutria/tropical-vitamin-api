import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';
import * as jwt from 'jsonwebtoken';
import { setTestEnv } from './test-env';

setTestEnv();
// Required after setTestEnv(): ConfigModule validates process.env on load.
/* eslint-disable @typescript-eslint/no-require-imports */
const { AppModule } = require('../src/app.module');
const { PrismaService } = require('../src/prisma/prisma.service');
const { UploadService } = require('../src/upload/upload.service');

export const adminToken = () =>
  jwt.sign({ sub: 1, email: 'admin@example.com' }, process.env.JWT_SECRET as string, {
    algorithm: 'HS256',
    expiresIn: '1h',
  });

export async function createApp(prisma: object) {
  const mod = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PrismaService)
    .useValue(prisma)
    .overrideProvider(MailerService)
    .useValue({ sendMail: jest.fn().mockResolvedValue({}) })
    .compile();
  const app = mod.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false, transform: true }),
  );
  await app.init();
  return app as INestApplication;
}

export { UploadService };
