import { Test, TestingModule } from '@nestjs/testing';
import { CustomersRepository } from './customers.repository';

describe('CustomersRepository', () => {
  let repository: CustomersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomersRepository],
    }).compile();

    repository = module.get<CustomersRepository>(CustomersRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });
});
