/* eslint-disable */
import { IError } from './httpClient';

export interface IHttpMock {
  getFullResponse: jest.Mock<Promise<any>>;
  get: jest.Mock<Promise<any>>
  post: jest.Mock<Promise<any>>
  postFullResponse: jest.Mock<Promise<any>>;
  patch: jest.Mock<Promise<any>>
  put: jest.Mock<Promise<any>>
  delete: jest.Mock<Promise<any>>
  setHeadersLanguage(lang: string): void;
  setHeadersTenant(tenantId: string): void;
  getFormattedError(error: IError): string;
}

export const mockHttp = (): IHttpMock => ({
  getFullResponse: jest.fn(() => Promise.resolve({ data: 'resolved' })),
  get: jest.fn(() => Promise.resolve('resolved')),
  post: jest.fn(() => Promise.resolve('resolved')),
  postFullResponse: jest.fn(() => Promise.resolve({data:'resolved'})),
  patch: jest.fn(() => Promise.resolve('resolved')),
  put: jest.fn(() => Promise.resolve('resolved')),
  delete: jest.fn(() => Promise.resolve('resolved')),
  setHeadersLanguage: jest.fn(),
  setHeadersTenant: jest.fn(),
  getFormattedError: jest.fn(),
});

export const mockHttpError = (): IError => ({
  status: 'status',
  code: 'code',
  title: 'title',
  detail: 'detail',
  meta: { meta: 'x' },
});
