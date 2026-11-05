import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { adminToken, createApp } from './helpers';

describe('Tour gallery (spec 006, e2e con Prisma simulado)', () => {
  let app: INestApplication;
  const tour = {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  const tourImage = { deleteMany: jest.fn(), createMany: jest.fn() };
  const tourTranslation = { upsert: jest.fn() };
  const language = { findFirst: jest.fn() };
  const prisma = {
    tour,
    tourImage,
    tourTranslation,
    language,
    $transaction: async (fn: (tx: unknown) => unknown) =>
      fn({ tour, tourImage, tourTranslation }),
  };

  beforeAll(async () => {
    app = await createApp(prisma);
  });
  afterAll(async () => {
    await app.close();
  });
  beforeEach(() => jest.resetAllMocks());

  const auth = (r: request.Test) =>
    r.set('Authorization', `Bearer ${adminToken()}`);
  const patch = (id: number, body: object) =>
    auth(request(app.getHttpServer()).patch(`/tours/${id}`)).send(body);
  const post = (body: object) =>
    auth(request(app.getHttpServer()).post('/tours')).send(body);
  const current = (isActive: boolean, images: number) =>
    tour.findUnique.mockResolvedValueOnce({ isActive, _count: { images } });

  describe('GET /tours (publico)', () => {
    it('AC-1/AC-16: filtra visibles con foto, sin location ni duration, con images', async () => {
      language.findFirst.mockResolvedValue({ id: 1, code: 'es' });
      tour.findMany.mockResolvedValue([]);
      await request(app.getHttpServer()).get('/tours?lang=es').expect(200);

      const arg = tour.findMany.mock.calls[0][0];
      expect(arg.where).toEqual({ isActive: true, images: { some: {} } });
      expect(arg.select).not.toHaveProperty('location');
      expect(arg.select).not.toHaveProperty('duration');
      expect(arg.select.img).toBe(true);
      expect(arg.select.images).toEqual({
        select: { filename: true },
        orderBy: { position: 'asc' },
      });
      expect(arg.orderBy).toEqual({ createdAt: 'asc' });
    });
  });

  describe('GET /tours/:id', () => {
    it('incluye images ordenadas por position', async () => {
      tour.findUnique.mockResolvedValue({ id: 7, images: [] });
      await request(app.getHttpServer()).get('/tours/7').expect(200);
      expect(tour.findUnique.mock.calls[0][0].include.images).toEqual({
        orderBy: { position: 'asc' },
      });
    });
  });

  describe('PATCH /tours/:id', () => {
    it('401 sin token', async () => {
      await request(app.getHttpServer())
        .patch('/tours/1')
        .send({ images: [] })
        .expect(401);
      expect(tour.update).not.toHaveBeenCalled();
    });

    it('AC-10: reemplaza la galeria en orden y img = images[0] en una transaccion', async () => {
      current(true, 3);
      tour.update.mockResolvedValue({});
      tour.findUnique.mockResolvedValueOnce({ id: 7, images: [] });
      await patch(7, {
        images: ['/uploads/b.jpg', 'a.png', 'c.webp'],
        img: '/uploads/otra.jpg',
      }).expect(200);

      expect(tour.update).toHaveBeenCalledTimes(1);
      expect(tour.update.mock.calls[0][0].data.img).toBe('/uploads/b.jpg');
      expect(tourImage.deleteMany).toHaveBeenCalledWith({
        where: { tourId: 7 },
      });
      expect(tourImage.createMany).toHaveBeenCalledWith({
        data: [
          { tourId: 7, filename: 'b.jpg', position: 0 },
          { tourId: 7, filename: 'a.png', position: 1 },
          { tourId: 7, filename: 'c.webp', position: 2 },
        ],
      });
    });

    it('el img del cuerpo se ignora sin images', async () => {
      current(true, 2);
      tour.update.mockResolvedValue({});
      tour.findUnique.mockResolvedValueOnce({ id: 7, images: [] });
      await patch(7, { adminTitle: 'X', img: '/uploads/hack.jpg' }).expect(200);
      expect(tour.update.mock.calls[0][0].data).toEqual({ adminTitle: 'X' });
      expect(tourImage.deleteMany).not.toHaveBeenCalled();
    });

    it('AC-11: 9 fotos -> 400 TOO_MANY_IMAGES y no escribe', async () => {
      const nine = Array.from({ length: 9 }, (_, i) => `f${i}.jpg`);
      const res = await patch(7, { images: nine }).expect(400);
      expect(res.body).toEqual({
        statusCode: 400,
        code: 'TOO_MANY_IMAGES',
        message: 'Un tour admite como máximo 8 fotos.',
        max: 8,
      });
      expect(tour.update).not.toHaveBeenCalled();
    });

    it('8 fotos pasa', async () => {
      const eight = Array.from({ length: 8 }, (_, i) => `f${i}.jpg`);
      current(true, 0);
      tour.update.mockResolvedValue({});
      tour.findUnique.mockResolvedValueOnce({ id: 7, images: [] });
      await patch(7, { images: eight }).expect(200);
      expect(tourImage.createMany.mock.calls[0][0].data).toHaveLength(8);
    });

    it.each([['../x.jpg'], ['a.svg'], ['x/y.jpg']])(
      '400 INVALID_IMAGES: %s',
      async (name) => {
        const res = await patch(7, { images: [name] }).expect(400);
        expect(res.body.code).toBe('INVALID_IMAGES');
        expect(tour.update).not.toHaveBeenCalled();
      },
    );

    it('AC-15: duration 0 -> 400 INVALID_DURATION', async () => {
      const res = await patch(7, { duration: 0 }).expect(400);
      expect(res.body).toEqual({
        statusCode: 400,
        code: 'INVALID_DURATION',
        message: 'La duración debe ser un número entero de minutos, 1 o más.',
      });
      expect(tour.update).not.toHaveBeenCalled();
    });

    it('AC-15: location y duration vacias pasan a null; sin ellos no se tocan', async () => {
      current(true, 1);
      tour.update.mockResolvedValue({});
      tour.findUnique.mockResolvedValueOnce({ id: 7, images: [] });
      await patch(7, { location: '   ', duration: null }).expect(200);
      expect(tour.update.mock.calls[0][0].data).toEqual({
        location: null,
        duration: null,
      });

      current(true, 1);
      tour.findUnique.mockResolvedValueOnce({ id: 7, images: [] });
      await patch(7, { adminTitle: 'Solo nombre' }).expect(200);
      expect(tour.update.mock.calls[1][0].data).toEqual({
        adminTitle: 'Solo nombre',
      });
    });

    it('AC-16: PATCH { isActive: true } sin fotos -> 409 TOUR_NEEDS_PHOTO y no escribe', async () => {
      current(false, 0);
      const res = await patch(7, { isActive: true }).expect(409);
      expect(res.body).toEqual({
        statusCode: 409,
        code: 'TOUR_NEEDS_PHOTO',
        message: 'Agrega al menos una foto para mostrar el tour en la web.',
      });
      expect(tour.update).not.toHaveBeenCalled();
      expect(tourImage.deleteMany).not.toHaveBeenCalled();
    });

    it('AC-16: PATCH { images: [] } de un tour visible -> 409', async () => {
      current(true, 2);
      await patch(7, { images: [] }).expect(409);
      expect(tourImage.deleteMany).not.toHaveBeenCalled();
    });

    it('AC-16: images [] mas isActive false de un tour visible -> 200 y vacia la galeria', async () => {
      current(true, 2);
      tour.update.mockResolvedValue({});
      tour.findUnique.mockResolvedValueOnce({ id: 7, images: [] });
      await patch(7, { images: [], isActive: false }).expect(200);
      expect(tour.update.mock.calls[0][0].data).toEqual({
        isActive: false,
        img: null,
      });
      expect(tourImage.createMany).toHaveBeenCalledWith({ data: [] });
    });

    it('PATCH { isActive: true } con fotos existentes -> 200', async () => {
      current(false, 2);
      tour.update.mockResolvedValue({});
      tour.findUnique.mockResolvedValueOnce({ id: 7, images: [] });
      await patch(7, { isActive: true }).expect(200);
      expect(tour.update.mock.calls[0][0].data).toEqual({ isActive: true });
    });

    it('tour inexistente -> 404', async () => {
      tour.findUnique.mockResolvedValueOnce(null);
      await patch(99, { adminTitle: 'X' }).expect(404);
    });
  });

  describe('POST /tours', () => {
    const base = { adminTitle: 'Cenotes', price: '1000', categoryId: 2 };

    it('401 sin token', async () => {
      await request(app.getHttpServer()).post('/tours').send(base).expect(401);
    });

    it('AC-16: visible sin fotos -> 409 y no crea', async () => {
      await post(base).expect(409);
      await post({ ...base, isActive: true, images: [] }).expect(409);
      expect(tour.create).not.toHaveBeenCalled();
    });

    it('oculto sin fotos -> 201, img null', async () => {
      tour.create.mockResolvedValue({ id: 8 });
      tour.findUnique.mockResolvedValue({ id: 8, images: [] });
      await post({ ...base, isActive: false }).expect(201);
      const data = tour.create.mock.calls[0][0].data;
      expect(data.img).toBeNull();
      expect(data.location).toBeNull();
      expect(data.duration).toBeNull();
    });

    it('AC-10: con fotos -> galeria en orden e img = images[0]', async () => {
      tour.create.mockResolvedValue({ id: 8 });
      tour.findUnique.mockResolvedValue({ id: 8, images: [] });
      await post({
        ...base,
        images: ['x.jpg', 'y.jpg'],
        location: ' Tulum ',
        duration: 90,
      }).expect(201);
      const data = tour.create.mock.calls[0][0].data;
      expect(data.img).toBe('/uploads/x.jpg');
      expect(data.location).toBe('Tulum');
      expect(data.duration).toBe(90);
      expect(data.images.create).toEqual([
        { filename: 'x.jpg', position: 0 },
        { filename: 'y.jpg', position: 1 },
      ]);
    });

    it('AC-11/AC-15: 400 con 9 fotos y con duration invalida', async () => {
      const nine = Array.from({ length: 9 }, (_, i) => `f${i}.jpg`);
      expect(
        (await post({ ...base, images: nine }).expect(400)).body.code,
      ).toBe('TOO_MANY_IMAGES');
      expect(
        (
          await post({ ...base, images: ['a.jpg'], duration: 'abc' }).expect(
            400,
          )
        ).body.code,
      ).toBe('INVALID_DURATION');
      expect(tour.create).not.toHaveBeenCalled();
    });
  });
});
