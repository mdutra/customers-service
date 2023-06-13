import { Test, TestingModule } from '@nestjs/testing';
import { CustomersModule } from './customers.module';
import { CustomersService } from './customers.service';
import { CustomersRepository } from './customers.repository';

const result = { id: '1', name: 'a', document: 'b' };

describe('CustomersService', () => {
  let service: CustomersService;
  let repository: CustomersRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CustomersModule],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    repository = module.get<CustomersRepository>(CustomersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find one', async () => {
    jest.spyOn(repository, 'findById').mockResolvedValue(result);

    const customer = await service.findOne('1');

    expect(customer).toEqual(result);
  });

  it('should not find one', async () => {
    jest.spyOn(repository, 'findById').mockResolvedValue(null);

    const promise = service.findOne('1');

    expect(promise).rejects.toThrow();
  });

  it('should create', async () => {
    jest.spyOn(repository, 'create').mockResolvedValue(result);

    const customer = await service.create({ name: 'c', document: 'd' });

    expect(customer).toEqual(result);
  });

  it('should update', async () => {
    jest.spyOn(repository, 'findByIdAndUpdate').mockResolvedValue(result);

    const customer = await service.update('1', {
      id: '2',
      name: 'a',
      document: 'b',
    });

    expect(customer).toEqual(result);
  });

  it('should not find when trying to update', async () => {
    jest.spyOn(repository, 'findByIdAndUpdate').mockResolvedValue(null);

    const promise = service.update('1', {
      id: '2',
      name: 'a',
      document: 'b',
    });

    expect(promise).rejects.toThrow();
  });
});
