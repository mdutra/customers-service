import { Test, TestingModule } from '@nestjs/testing';
import { CustomersModule } from './customers.module';
import { CustomersRepository } from './customers.repository';
import { RedisService } from '../redis/redis.service';

const result = { id: '1', name: 'b', document: 'c' };

describe('CustomersRepository', () => {
  let repository: CustomersRepository;
  let redisService: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CustomersModule],
    }).compile();

    repository = module.get<CustomersRepository>(CustomersRepository);
    redisService = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should find by id', async () => {
    jest.spyOn(redisService, 'getHash').mockResolvedValue(result);

    const customer = await repository.findById(result.id);

    expect(customer).toEqual(result);
  });

  it('should return null', async () => {
    jest.spyOn(redisService, 'getHash').mockResolvedValue({});

    const customer = await repository.findById(result.id);

    expect(customer).toEqual(null);
  });

  it('should create', async () => {
    jest.spyOn(redisService, 'newHash').mockResolvedValue('123');

    const customer = await repository.create({ name: 'a', document: 'b' });

    expect(customer).toEqual({ id: '123', name: 'a', document: 'b' });
  });

  it('should find by id and update contents', async () => {
    const id = '123';
    const hash = { name: 'c', document: 'd' };
    jest.spyOn(redisService, 'getHash').mockResolvedValue(result);
    jest.spyOn(redisService, 'updateContentsById').mockResolvedValue(hash);

    const customer = await repository.findByIdAndUpdate(id, hash);

    expect(customer).toEqual({ id, ...hash });
  });

  it('should return null', async () => {
    jest.spyOn(redisService, 'getHash').mockResolvedValue({});

    const customer = await repository.findByIdAndUpdate('123', {
      name: 'c',
      document: 'd',
    });

    expect(customer).toEqual(null);
  });

  it('should update customer ID', async () => {
    jest.spyOn(redisService, 'getHash').mockResolvedValueOnce(result);
    jest.spyOn(redisService, 'getHash').mockResolvedValueOnce({});
    jest
      .spyOn(redisService, 'overwriteHash')
      .mockResolvedValue({ name: 'c', document: 'd' });

    const customer = await repository.findByIdAndUpdate('123', {
      id: '456', // should update ID
      name: 'c',
      document: 'd',
    });

    expect(customer).toEqual({
      id: '456',
      name: 'c',
      document: 'd',
    });
  });

  it('should throw conlict of IDs', async () => {
    // will return a customer in the first and second call
    jest.spyOn(redisService, 'getHash').mockResolvedValue(result);

    const promise = repository.findByIdAndUpdate('123', {
      id: '456', // should update ID
      name: 'c',
      document: 'd',
    });

    expect(promise).rejects.toThrow('Conflict');
  });
});
