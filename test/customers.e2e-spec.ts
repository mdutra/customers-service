import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { CustomersModule } from '../src/customers/customers.module';
import { INestApplication } from '@nestjs/common';
import { redisMock } from './mock/redis.mock';

describe('/customers (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CustomersModule],
    })
      .overrideProvider('REDIS_CLIENT')
      .useValue(redisMock)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET', () => {
    it('should find customer by ID', async () => {
      const id = '456';

      const response = await request(app.getHttpServer()).get(
        `/customers/${id}`,
      );

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/json/);
      expect(redisMock.hgetall).toBeCalled();
      expect(response.body).toEqual({ id, ...redisMock.hgetall() });
      redisMock.hgetall.mockClear();
    });

    it('should not find customer by ID', async () => {
      const id = '456';
      redisMock.hgetall.mockReturnValueOnce({});

      const response = await request(app.getHttpServer()).get(
        `/customers/${id}`,
      );

      expect(response.status).toBe(404);
      expect(response.headers['content-type']).toMatch(/json/);
      expect(redisMock.hgetall).toBeCalled();
      expect(response.body).toEqual({ message: 'Not Found', statusCode: 404 });
      redisMock.hgetall.mockClear();
    });

    it('cache should be unavailable', async () => {
      const id = '456';
      const status = jest.replaceProperty(redisMock, 'status', 'reconnecting');

      const response = await request(app.getHttpServer()).get(
        `/customers/${id}`,
      );

      expect(response.status).toBe(502);
      expect(response.headers['content-type']).toMatch(/json/);
      expect(redisMock.hgetall).not.toBeCalled();
      expect(response.body).toEqual({
        error: 'Bad Gateway',
        statusCode: 502,
        message: 'Cache unavailable',
      });
      status.restore();
    });
  });

  describe('POST', () => {
    it('should save new customer', async () => {
      const requestBody = { name: 'foo', document: '456' };

      const response = await request(app.getHttpServer())
        .post('/customers')
        .send(requestBody);

      expect(response.status).toBe(201);
      expect(response.headers['content-type']).toMatch(/json/);
      expect(redisMock.hmset).toBeCalled();
      expect(response.body).toEqual(expect.objectContaining(requestBody));
      expect(response.body.id).toEqual(expect.any(String));
      expect(response.body.id.length).toBeGreaterThan(0);
      redisMock.hmset.mockClear();
    });
  });

  describe('PUT', () => {
    it('should update customer data', async () => {
      const id = '456';
      const requestBody = { name: 'bar', document: '789' };

      const response = await request(app.getHttpServer())
        .put(`/customers/${id}`)
        .send(requestBody);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toEqual({
        id,
        ...requestBody,
      });
    });

    it('should not find customer when updating', async () => {
      const id = '456';
      const requestBody = { name: 'baz', document: '1000' };
      redisMock.hgetall.mockReturnValueOnce({});

      const response = await request(app.getHttpServer())
        .put(`/customers/${id}`)
        .send(requestBody);

      expect(response.status).toBe(404);
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toEqual({ message: 'Not Found', statusCode: 404 });
    });

    it('should update customer ID and customer data', async () => {
      const id = '2000';
      const requestBody = { id: '3000', name: 'foo bar', document: '200' };

      const response = await request(app.getHttpServer())
        .put(`/customers/${id}`)
        .send(requestBody);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toEqual(requestBody);
    });
  });
});
