import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { adminToken, createApp } from './helpers';

describe('Language protections (e2e)', () => {
  let app: INestApplication;
  const language = { findUnique: jest.fn(), delete: jest.fn(), update: jest.fn() };

  beforeAll(async () => {
    app = await createApp({ language });
  });
  afterAll(async () => {
    await app.close();
  });
  beforeEach(() => jest.resetAllMocks());

  const call = (method: 'delete' | 'patch', id: number) =>
    request(app.getHttpServer())[method](`/languages/${id}`).set('Authorization', `Bearer ${adminToken()}`);

  describe.each(['es', 'en'])('AC-23: %s', (code) => {
    beforeEach(() => language.findUnique.mockResolvedValue({ id: 1, code, name: 'x', isActive: true }));

    it('DELETE -> 409 LANGUAGE_PROTECTED', async () => {
      const res = await call('delete', 1).expect(409);
      expect(res.body).toEqual({
        statusCode: 409,
        code: 'LANGUAGE_PROTECTED',
        message: `El idioma ${code} lo usa la web y no se puede eliminar.`,
      });
      expect(language.delete).not.toHaveBeenCalled();
    });

    it('PATCH changing code -> 409 LANGUAGE_PROTECTED', async () => {
      const res = await call('patch', 1).send({ code: 'xx' }).expect(409);
      expect(res.body.code).toBe('LANGUAGE_PROTECTED');
      expect(language.update).not.toHaveBeenCalled();
    });

    it('PATCH name / isActive / same code -> 200', async () => {
      language.update.mockResolvedValue({ id: 1 });
      await call('patch', 1).send({ name: 'Nuevo', isActive: false }).expect(200);
      await call('patch', 1).send({ code: code.toUpperCase() }).expect(200);
      expect(language.update).toHaveBeenCalledTimes(2);
    });
  });

  it('DELETE other language -> 200 and deletes', async () => {
    language.findUnique.mockResolvedValue({ id: 3, code: 'fr' });
    language.delete.mockResolvedValue({ id: 3, code: 'fr' });
    await call('delete', 3).expect(200);
    expect(language.delete).toHaveBeenCalledWith({ where: { id: 3 } });
  });

  it('PATCH code of other language -> 200', async () => {
    language.findUnique.mockResolvedValue({ id: 3, code: 'fr' });
    language.update.mockResolvedValue({ id: 3 });
    await call('patch', 3).send({ code: 'de' }).expect(200);
  });

  it('DELETE missing language -> 404', async () => {
    language.findUnique.mockResolvedValue(null);
    await call('delete', 99).expect(404);
    expect(language.delete).not.toHaveBeenCalled();
  });
});
