import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { CustomersModule } from './customers.module';

describe('CustomersController', () => {
  let controller: CustomersController;
  let service: CustomersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CustomersModule],
    }).compile();

    controller = module.get<CustomersController>(CustomersController);
    service = module.get<CustomersService>(CustomersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findOne', async () => {
    const result = { id: '1', name: 'a', document: 'b' };
    jest.spyOn(service, 'findOne').mockResolvedValue(result);

    const customer = await controller.findOne('');

    expect(customer).toBe(result);
  });

  it('create', async () => {
    const result = { id: '1', name: 'a', document: 'b' };
    jest.spyOn(service, 'create').mockResolvedValue(result);

    const customer = await controller.create({ name: 'c', document: 'd' });

    expect(customer).toBe(result);
  });

  it('update', async () => {
    const result = { id: '1', name: 'a', document: 'b' };
    jest.spyOn(service, 'update').mockResolvedValue(result);

    const customer = await controller.update('1', {
      id: '2',
      name: 'c',
      document: 'd',
    });

    expect(customer).toBe(result);
  });
});
