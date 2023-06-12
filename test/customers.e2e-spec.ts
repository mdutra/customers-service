import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { v4 as uuid } from 'uuid';
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
      const id = uuid();

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
      const id = uuid();
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

    it('should fail validation (400)', async () => {
      const requestBody = { name: 123, document: '456' };

      const response = await request(app.getHttpServer())
        .post('/customers')
        .send(requestBody);

      expect(response.status).toBe(400);
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toEqual({
        error: 'Bad Request',
        message: 'Validation failed',
        statusCode: 400,
      });
    });
  });

  describe('PUT', () => {
    it('should update customer data', async () => {
      const id = uuid();
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

    it('should fail validation (400)', async () => {
      const id = uuid();
      const requestBody = { name: 'bar', document: 123 };

      const response = await request(app.getHttpServer())
        .put(`/customers/${id}`)
        .send(requestBody);

      expect(response.status).toBe(400);
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toEqual({
        error: 'Bad Request',
        message: 'Validation failed',
        statusCode: 400,
      });
    });

    it('should not find customer when updating', async () => {
      const id = uuid();
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
      const id = uuid();
      const requestBody = { id: uuid(), name: 'foo bar', document: '200' };

      const response = await request(app.getHttpServer())
        .put(`/customers/${id}`)
        .send(requestBody);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toEqual(requestBody);
    });
  });
});
