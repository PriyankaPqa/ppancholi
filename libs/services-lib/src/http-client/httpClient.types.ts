import { AxiosRequestConfig } from 'axios';
import { IMultilingual } from '@libs/shared-lib/types';
import { IEntity } from '@libs/entities-lib/base';
/* eslint-disable */

// Disabled = reject and return immediately
// Enabled = display generic error toasters for 401/403 errors or errors with no data, use error403Handler or errorGlobalHandler
// Partial = same behavior for 401/403 or no data errors, reject and return instead of using the -Handler methods
export enum GlobalHandler {
  Enabled = "Enabled",
  Partial = "Partial",
  Disabled = "Disabled",
}

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
  globalHandler?: GlobalHandler;
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
  accessToken: string;
  redirect403Url: string;
  timerBeforeRedirection: number;
  useErrorReport: boolean;
  baseUrl: string;
  localBaseUrl: string;
  localApiPortMap: string;
}

export interface IHttpClient {
  baseUrl: string;
  getFullResponse: <T>(url: string, config?: RequestConfig) => Promise<IRestResponse<T>>;
  postFullResponse: <T>(url: string, data?: any, config?: RequestConfig) => Promise<IRestResponse<T>>;
  get: <T>(url: string, config?: RequestConfig) => Promise<T>;
  post: <T>(url: string, data?: any, config?: RequestConfig) => Promise<T>;
  patch: <T>(url: string, data?: any, config?: RequestConfig) => Promise<T>;
  put: <T>(url: string, data?: any, config?: RequestConfig) => Promise<T>;
  delete: <T>(url: string, data?: any) => Promise<T>;
  setHeadersLanguage(lang: string): void;
  setHeadersTenant(tenantId: string): void;
  setPublicToken(token: string): void;
  getTenant(): string;
  getFormattedError(error: IError): string;
  getRestResponseAsFile(response: IRestResponse<BlobPart>, saveFile?: boolean, fileName?: string) : string;
  getPayloadAsFile(payload: any, propertyName?: string): FormData;
}

export interface IHttpMock {
  baseUrl: string;
  getFullResponse: jest.Mock<Promise<any>>;
  get: jest.Mock<Promise<any>>
  post: jest.Mock<Promise<any>>
  postFullResponse: jest.Mock<Promise<any>>;
  patch: jest.Mock<Promise<any>>
  put: jest.Mock<Promise<any>>
  delete: jest.Mock<Promise<any>>
  setHeadersLanguage: jest.Mock<void>;
  setHeadersTenant: jest.Mock<void>;
  setPublicToken: jest.Mock<void>;
  getTenant: jest.Mock<string>;
  getFormattedError: jest.Mock<string>;
  getRestResponseAsFile: jest.Mock<string>;
  getPayloadAsFile: jest.Mock<FormData>;
}
