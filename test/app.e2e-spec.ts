import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as request from 'supertest';
import { v4 as uuid } from 'uuid';
import { AppModule } from './../src/app.module';
import { redisMock } from './mock/redis.mock';
import { axiosMock } from './mock/axios.mock';
import { AxiosError } from 'axios';

const id = uuid();

describe('general requests (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(HttpService)
      .useValue(axiosMock)
      .overrideProvider('REDIS_CLIENT')
      .useValue(redisMock)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should authorize', () => {
    return request(app.getHttpServer())
      .get(`/customers/${id}`)
      .set('Authorization', 'Bearer abc')
      .expect(200);
  });

  it('should not authorize (401) if token is invalid', () => {
    axiosMock.axiosRef.mockReturnValueOnce({ data: { active: false } });

    return request(app.getHttpServer())
      .get(`/customers/${id}`)
      .set('Authorization', 'Bearer abc')
      .expect(401)
      .expect({
        statusCode: 401,
        message: 'Token is not valid',
        error: 'Unauthorized',
      });
  });

  it('should not authorize (401) if token was not set', () => {
    return request(app.getHttpServer())
      .get(`/customers/${id}`)
      .expect(401)
      .expect({
        statusCode: 401,
        message: 'Missing token in the Authorization header',
        error: 'Unauthorized',
      });
  });

  it('should return 502 - SSO unavailable', () => {
    axiosMock.axiosRef.mockImplementationOnce(() => {
      const err = new AxiosError();
      err.request = true;
      throw err;
    });

    return request(app.getHttpServer())
      .get(`/customers/${id}`)
      .set('Authorization', 'Bearer abc')
      .expect(502)
      .expect({
        statusCode: 502,
        message: 'SSO unavailable',
        error: 'Bad Gateway',
      });
  });

  it('should return 502 - Cache unavailable', async () => {
    const status = jest.replaceProperty(redisMock, 'status', 'reconnecting');

    const response = await request(app.getHttpServer())
      .get(`/customers/${id}`)
      .set('Authorization', 'Bearer abc');

    expect(response.status).toBe(502);
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.body).toEqual({
      error: 'Bad Gateway',
      statusCode: 502,
      message: 'Cache unavailable',
    });
    status.restore();
  });
});
