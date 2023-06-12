export const redisMock = {
  status: '',
  hgetall: jest.fn().mockReturnValue({
    name: 'abc',
    document: '123',
  }),
  hmset: jest.fn(),
  multi: jest.fn().mockReturnValue({
    hmset: jest.fn().mockReturnThis(),
    del: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  }),
};
