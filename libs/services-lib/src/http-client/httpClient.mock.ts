import { IServerError } from '@libs/shared-lib/types';
import { IRestResponse, IHttpMock, IError } from './httpClient.types';

export const mockIRestResponse = (data: unknown, statusCode = 200): IRestResponse<unknown> => ({
  headers: {},
  success: true,
  status: statusCode,
  statusText: '',
  data,
});

export const mockHttp = (): IHttpMock => ({
  baseUrl: 'www.test.com',
  getFullResponse: jest.fn(() => Promise.resolve(mockIRestResponse('resolved'))),
  get: jest.fn(() => Promise.resolve('resolved')),
  post: jest.fn(() => Promise.resolve('resolved')),
  postFullResponse: jest.fn(() => Promise.resolve(mockIRestResponse('resolved'))),
  patch: jest.fn(() => Promise.resolve('resolved')),
  put: jest.fn(() => Promise.resolve('resolved')),
  delete: jest.fn(() => Promise.resolve('resolved')),
  setHeadersLanguage: jest.fn(),
  setHeadersTenant: jest.fn(),
  getTenant: jest.fn(() => 'tenantId'),
  getFormattedError: jest.fn(),
  getRestResponseAsFile: jest.fn(() => 'myUrl'),
});

export const mockHttpErrorResponse = (data: unknown, statusCode: number) => ({
  response: {
    ...mockIRestResponse(data, statusCode),
  },
});

export const mockHttpError = (force?: Partial<IError>): IError => ({
  status: 'status',
  code: 'code',
  title: 'title',
  detail: 'detail',
  meta: { meta: 'x' },
  ...force,
});

export const mockServerError = (errors?: Array<IError>): IServerError => ({
  name: '',
  message: '',
  request: { responseURL: '' },
  response: {
    data: {
      errors: errors || [mockHttpError()],
    },
    status: '',
    config: { data: '' },
  },
});
