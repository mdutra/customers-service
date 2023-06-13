import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

const contextMock = (
  headers: any = {
    authorization: 'Bearer abc',
  },
) => {
  const ExecutionContext = jest.fn().mockReturnValue({
    switchToHttp: jest.fn().mockReturnThis(),
    getRequest: jest.fn().mockReturnValue({
      headers,
    }),
  });

  return new ExecutionContext();
};

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let service: AuthService;

  beforeAll(async () => {
    service = new AuthService(new ConfigService(), new HttpService());
    guard = new AuthGuard(service);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should not throw errors', async () => {
    jest.spyOn(service, 'verify').mockResolvedValue(undefined);

    const result = await guard.canActivate(contextMock());

    expect(result).toBe(true);
  });

  it('should throw unauthorized if token was not provided', () => {
    jest.spyOn(service, 'verify').mockResolvedValue(undefined);

    const promise = guard.canActivate(contextMock({}));

    expect(promise).rejects.toThrow('Unauthorized');
  });
});
