/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosRequestConfig } from 'axios';

export interface IRestResponse<T> {
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

export interface IHttpClient {
  get: <T>(url: string, config?: RequestConfig) => Promise<T>;
  post: <T>(url: string, data?: any, config?: RequestConfig) => Promise<T>;
  patch: <T>(url: string, data?: any, config?: RequestConfig) => Promise<T>;
  put: <T>(url: string, data?: any, config?: RequestConfig) => Promise<T>;
  delete: <T>(url: string, config?: RequestConfig) => Promise<T>;
  setHeadersLanguage(lang: string): void;
  setHeadersTenant(tenantId: string): void;
}

export interface IError {
  status: string;
  code: string;
  title: string;
  detail: string;
  meta: Record<string, string>;
}
