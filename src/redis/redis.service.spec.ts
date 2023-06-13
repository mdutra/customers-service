import { Test, TestingModule } from '@nestjs/testing';
import { RedisModule } from './redis.module';
import { RedisService } from './redis.service';
import { redisMock } from '../../test/mock/redis.mock';
import { ReplyError } from 'ioredis';

describe('RedisService', () => {
  let service: RedisService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RedisModule],
    })
      .overrideProvider('REDIS_CLIENT')
      .useValue(redisMock)
      .compile();

    service = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get hash', async () => {
    const hash = await service.getHash('prefix', '123');

    expect(hash).toEqual(redisMock.hgetall());
  });

  it('should throw cache unavailable', async () => {
    const status = jest.replaceProperty(redisMock, 'status', 'reconnecting');

    const promise = service.getHash('prefix', '123');

    expect(promise).rejects.toThrow('Cache unavailable');
    status.restore();
  });

  it('should return null', async () => {
    redisMock.hgetall.mockImplementationOnce(() => {
      throw new ReplyError();
    });

    const hash = await service.getHash('prefix', '123');

    expect(hash).toBeNull();
  });

  it('should create new hash', async () => {
    const id = await service.newHash('prefix', { x: 'a' });

    expect(id).toEqual(expect.any(String));
    expect(id.length).toBeGreaterThan(0);
  });

  it('should update contents by id', async () => {
    const hash = await service.updateContentsById('prefix', '123', { x: '1' });

    expect(hash).toEqual({ x: '1' });
  });

  it('should overwrite hash', async () => {
    const hash = await service.overwriteHash('prefix', '123', '456', {
      x: '1',
    });

    expect(hash).toEqual({ x: '1' });
  });
});
