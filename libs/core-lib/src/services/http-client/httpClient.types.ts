import { AxiosRequestConfig } from 'axios';
import { IMultilingual } from '@/types';
/* eslint-disable */
export interface IRestResponse<T> {
  headers?: any;
  success: boolean;
  status: number;
  statusText: string;
  data: T;
}

export interface RequestConfig extends AxiosRequestConfig {
  globalHandler?: boolean;
  noErrorLogging?: boolean;
  isOData?: boolean;
  containsEncodedURL?: boolean;
  ignoreJwt?: boolean;
}

export interface IError {
  status: string,
  code: string,
  title: string,
  detail: string,
  meta: Record<string, string | IMultilingual>
}

export interface IHttpClientOptions {
  authentication: boolean;
  accessTokenKey: string;
  redirect403Url: string;
  timerBeforeRedirection: number;
}

export interface IHttpClient {
  getFullResponse: <T>(url: string, config?: RequestConfig) => Promise<IRestResponse<T>>;
  postFullResponse: <T>(url: string, data?: any, config?: RequestConfig) => Promise<IRestResponse<T>>;
  get: <T>(url: string, config?: RequestConfig) => Promise<T>;
  post: <T>(url: string, data?: any, config?: RequestConfig) => Promise<T>;
  patch: <T>(url: string, data?: any, config?: RequestConfig) => Promise<T>;
  put: <T>(url: string, data?: any, config?: RequestConfig) => Promise<T>;
  delete: <T>(url: string, data?: any) => Promise<T>;
  setHeadersLanguage(lang: string): void;
  setHeadersTenant(tenantId: string): void;
  getFormattedError(error: IError): string;
}

export interface IHttpMock {
  getFullResponse: jest.Mock<Promise<any>>;
  get: jest.Mock<Promise<any>>
  post: jest.Mock<Promise<any>>
  postFullResponse: jest.Mock<Promise<any>>;
  patch: jest.Mock<Promise<any>>
  put: jest.Mock<Promise<any>>
  delete: jest.Mock<Promise<any>>
  setHeadersLanguage: jest.Mock<void>;
  setHeadersTenant: jest.Mock<void>;
  getFormattedError: jest.Mock<string>;
}
