import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { adminToken, createApp } from './helpers';

const row = {
  id: 1,
  facebookUrl: 'https://www.facebook.com/tv',
  facebookVisible: true,
  instagramUrl: 'https://instagram.com/tv',
  instagramVisible: false,
  linkedinUrl: null,
  linkedinVisible: false,
  whatsappNumber: '529841681263',
  updatedAt: new Date('2026-11-05T12:00:00.000Z'),
};

const body = {
  facebookUrl: null,
  facebookVisible: false,
  instagramUrl: null,
  instagramVisible: false,
  linkedinUrl: null,
  linkedinVisible: false,
  whatsappNumber: '529841681263',
};

describe('Social settings (e2e)', () => {
  let app: INestApplication;
  const socialSettings = { findUnique: jest.fn(), upsert: jest.fn() };

  beforeAll(async () => {
    app = await createApp({ socialSettings });
  });
  afterAll(async () => {
    await app.close();
  });
  beforeEach(() => jest.resetAllMocks());

  const http = () => request(app.getHttpServer());
  const auth = { Authorization: `Bearer ${adminToken()}` };

  describe('GET /social (público)', () => {
    it('devuelve solo redes con URL y visibles, sin auth y con no-cache', async () => {
      socialSettings.findUnique.mockResolvedValue({
        ...row,
        linkedinVisible: true,
      });
      const res = await http().get('/social').expect(200);
      expect(res.headers['cache-control']).toBe('no-cache');
      expect(res.body).toEqual({
        whatsappNumber: '529841681263',
        networks: [{ network: 'facebook', url: 'https://www.facebook.com/tv' }],
      });
    });

    it('sin la fila 1 devuelve los valores por defecto', async () => {
      socialSettings.findUnique.mockResolvedValue(null);
      const res = await http().get('/social').expect(200);
      expect(res.body).toEqual({
        whatsappNumber: '529841681263',
        networks: [],
      });
    });

    it('no tiene throttle: 70 lecturas seguidas responden 200', async () => {
      socialSettings.findUnique.mockResolvedValue(row);
      for (let i = 0; i < 70; i++) await http().get('/social').expect(200);
    });
  });

  describe('AC-1: sesión', () => {
    it('GET /social/admin y PUT /social sin token -> 401', async () => {
      await http().get('/social/admin').expect(401);
      await http().put('/social').send(body).expect(401);
      expect(socialSettings.upsert).not.toHaveBeenCalled();
    });

    it('GET /social/admin con token devuelve todo, incluso lo oculto', async () => {
      socialSettings.findUnique.mockResolvedValue(row);
      const res = await http().get('/social/admin').set(auth).expect(200);
      expect(res.body).toEqual({
        facebookUrl: 'https://www.facebook.com/tv',
        facebookVisible: true,
        instagramUrl: 'https://instagram.com/tv',
        instagramVisible: false,
        linkedinUrl: null,
        linkedinVisible: false,
        whatsappNumber: '529841681263',
        updatedAt: '2026-11-05T12:00:00.000Z',
      });
    });
  });

  describe('PUT /social', () => {
    it('AC-4: visible sin URL, dominio ajeno y WhatsApp corto -> 400 con fields y sin guardar', async () => {
      const res = await http()
        .put('/social')
        .set(auth)
        .send({
          ...body,
          facebookVisible: true,
          instagramUrl: 'facebook.com/x',
          linkedinUrl: 'hola',
          whatsappNumber: '12345',
        })
        .expect(400);
      expect(res.body).toEqual({
        statusCode: 400,
        code: 'INVALID_SOCIAL_SETTINGS',
        message: 'Revisa los campos marcados.',
        fields: {
          facebookVisible: 'VISIBLE_WITHOUT_URL',
          instagramUrl: 'DOMAIN',
          linkedinUrl: 'FORMAT',
          whatsappNumber: 'LENGTH',
        },
      });
      expect(socialSettings.upsert).not.toHaveBeenCalled();
    });

    it('WhatsApp vacío -> REQUIRED', async () => {
      const res = await http()
        .put('/social')
        .set(auth)
        .send({ ...body, whatsappNumber: '' })
        .expect(400);
      expect((res.body as { fields: unknown }).fields).toEqual({
        whatsappNumber: 'REQUIRED',
      });
    });

    it('normaliza y guarda con upsert; "" es null', async () => {
      socialSettings.upsert.mockImplementation(
        ({ create }: { create: object }) =>
          Promise.resolve({ ...create, updatedAt: row.updatedAt }),
      );
      const res = await http()
        .put('/social')
        .set(auth)
        .send({
          ...body,
          instagramUrl: ' instagram.com/tv ',
          instagramVisible: true,
          facebookUrl: '',
          whatsappNumber: '+52 984-168-1263',
        })
        .expect(200);
      const data = {
        facebookUrl: null,
        facebookVisible: false,
        instagramUrl: 'https://instagram.com/tv',
        instagramVisible: true,
        linkedinUrl: null,
        linkedinVisible: false,
        whatsappNumber: '529841681263',
      };
      expect(socialSettings.upsert).toHaveBeenCalledWith({
        where: { id: 1 },
        update: data,
        create: { id: 1, ...data },
      });
      expect(res.body).toEqual({
        ...data,
        updatedAt: '2026-11-05T12:00:00.000Z',
      });
    });

    it('tipos inválidos o claves faltantes -> 400 de ValidationPipe', async () => {
      await http()
        .put('/social')
        .set(auth)
        .send({ ...body, facebookVisible: 'si' })
        .expect(400);
      await http()
        .put('/social')
        .set(auth)
        .send({ ...body, facebookUrl: 5 })
        .expect(400);
      await http()
        .put('/social')
        .set(auth)
        .send({ ...body, instagramUrl: 'x'.repeat(301) })
        .expect(400);
      const missing: Partial<typeof body> = { ...body };
      delete missing.linkedinUrl;
      await http().put('/social').set(auth).send(missing).expect(400);
      expect(socialSettings.upsert).not.toHaveBeenCalled();
    });
  });
});
