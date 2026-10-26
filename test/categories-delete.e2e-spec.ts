import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { adminToken, createApp } from './helpers';

describe('DELETE /categories/:id protections (e2e)', () => {
  let app: INestApplication;
  const category = { findUnique: jest.fn(), delete: jest.fn() };
  const prisma = {
    category,
    $transaction: async (fn: (tx: unknown) => unknown) => fn({ category }),
  };

  beforeAll(async () => {
    app = await createApp(prisma);
  });
  afterAll(async () => {
    await app.close();
  });
  beforeEach(() => jest.resetAllMocks());

  const del = (id: number) =>
    request(app.getHttpServer())
      .delete(`/categories/${id}`)
      .set('Authorization', `Bearer ${adminToken()}`);

  it('AC-22: with tours -> 409 CATEGORY_HAS_TOURS and nothing is deleted', async () => {
    category.findUnique.mockResolvedValue({ id: 1, _count: { tours: 6 } });
    const res = await del(1).expect(409);
    expect(res.body).toEqual({
      statusCode: 409,
      code: 'CATEGORY_HAS_TOURS',
      message: 'La categoría tiene 6 tours. Muévelos a otra categoría antes de eliminarla.',
      tourCount: 6,
    });
    expect(category.delete).not.toHaveBeenCalled();
  });

  it('without tours -> 200 and deletes', async () => {
    category.findUnique.mockResolvedValue({ id: 2, _count: { tours: 0 } });
    category.delete.mockResolvedValue({ id: 2, adminName: 'vacia' });
    const res = await del(2).expect(200);
    expect(res.body).toEqual({ id: 2, adminName: 'vacia' });
    expect(category.delete).toHaveBeenCalledWith({ where: { id: 2 } });
  });

  it('missing category -> 404', async () => {
    category.findUnique.mockResolvedValue(null);
    await del(99).expect(404);
    expect(category.delete).not.toHaveBeenCalled();
  });
});
