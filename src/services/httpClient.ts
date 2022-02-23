/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosRequestConfig } from 'axios';
import { IMultilingual } from '../types';

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
  status: string;
  code: string;
  title: string;
  detail: string;
  meta: Record<string, string | IMultilingual>;
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
