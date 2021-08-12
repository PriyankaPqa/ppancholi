/* eslint-disable */
export interface IHttpMock {
  get: jest.Mock<Promise<any>>
  post: jest.Mock<Promise<any>>
  patch: jest.Mock<Promise<any>>
  put: jest.Mock<Promise<any>>
  delete: jest.Mock<Promise<any>>
}

export const mockHttp = (): IHttpMock => ({
  get: jest.fn(() => Promise.resolve('resolved')),
  post: jest.fn(() => Promise.resolve('resolved')),
  patch: jest.fn(() => Promise.resolve('resolved')),
  put: jest.fn(() => Promise.resolve('resolved')),
  delete: jest.fn(() => Promise.resolve('resolved')),
});
