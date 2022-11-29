import { AxiosRequestConfig } from 'axios';
import { IMultilingual } from '@libs/shared-lib/types';
import { IEntity } from '@libs/entities-lib/base';
/* eslint-disable */

export interface IFullResponseCombined <TEntity extends IEntity, TMetadata extends IEntity> {
  entity: IRestResponse<TEntity>,
  metadata: IRestResponse<TMetadata>,
  pinned?: boolean;
}

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
  useErrorReport: boolean;
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
  getTenant(): string;
  getFormattedError(error: IError): string;
  getRestResponseAsFile(response: IRestResponse<BlobPart>, saveFile?: boolean, fileName?: string) : string;
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
  getTenant: jest.Mock<string>;
  getFormattedError: jest.Mock<string>;
  getRestResponseAsFile: jest.Mock<string>;
}
