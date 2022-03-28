/* eslint-disable */
import {IRestResponse} from "@/services/httpClient";

export interface IHttpMock {
  getFullResponse: jest.Mock<Promise<any>>;
  get: jest.Mock<Promise<any>>
  post: jest.Mock<Promise<any>>
  postFullResponse: jest.Mock<Promise<any>>;
  patch: jest.Mock<Promise<any>>
  put: jest.Mock<Promise<any>>
  delete: jest.Mock<Promise<any>>
}

export const mockIRestResponse = (data: unknown): IRestResponse<unknown> => ({
    headers: {},
    success: true,
    status: 200,
    statusText: '',
    data,
});

export const mockHttp = (): IHttpMock => ({
  getFullResponse: jest.fn(() => Promise.resolve(mockIRestResponse('resolved'))),
  get: jest.fn(() => Promise.resolve('resolved')),
  post: jest.fn(() => Promise.resolve('resolved')),
  postFullResponse: jest.fn(() => Promise.resolve(mockIRestResponse('resolved'))),
  patch: jest.fn(() => Promise.resolve('resolved')),
  put: jest.fn(() => Promise.resolve('resolved')),
  delete: jest.fn(() => Promise.resolve('resolved')),
});
