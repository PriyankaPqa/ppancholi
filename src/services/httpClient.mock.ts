import { IError, IHttpClient } from './httpClient';

export interface IHttpMock {
  get: jest.Mock<void>;
  post: jest.Mock<void>;
  patch: jest.Mock<void>;
  put: jest.Mock<void>;
  delete: jest.Mock<void>;
}

export const mockHttp = (): IHttpMock & IHttpClient => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  setHeadersLanguage: jest.fn(),
  setHeadersTenant: jest.fn(),
});

export const mockHttpError = (): IError => ({
  status: 'status',
  code: 'code',
  title: 'title',
  detail: 'detail',
  meta: { meta: 'x' },
});
