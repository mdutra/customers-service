import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import { axiosMock } from '../../test/mock/axios.mock';
import { AxiosError } from 'axios';

describe('AuthService', () => {
  let service: AuthService;
  let configService: ConfigService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(HttpService)
      .useValue(axiosMock)
      .compile();

    service = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should not throw errors', () => {
    jest.spyOn(configService, 'get').mockReturnValue('');

    const promise = service.verify('abc');

    expect(promise).resolves.toBeUndefined;
  });

  it('should throw unauthorized', () => {
    jest.spyOn(configService, 'get').mockReturnValue('');
    axiosMock.axiosRef.mockReturnValueOnce({
      data: { active: false },
    });

    const promise = service.verify('abc');

    expect(promise).rejects.toThrow('Token is not valid');
  });

  it('should throw SSO unavailable', () => {
    jest.spyOn(configService, 'get').mockReturnValue('');
    axiosMock.axiosRef.mockImplementationOnce(() => {
      const err = new AxiosError();
      err.request = true;
      throw err;
    });

    const promise = service.verify('abc');

    expect(promise).rejects.toThrow('SSO unavailable');
  });
});
