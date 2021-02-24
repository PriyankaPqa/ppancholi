/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import buildQuery from '@/services/odata-query';
import camelCaseKeys from 'camelcase-keys';
import { localStorageKeys } from '@/constants/localStorage';
import { v4 as uuidv4 } from 'uuid';
import Vue from 'vue';
import { ISearchData } from '@/types';

export interface IRestResponse<T> {
  success: boolean;
  status: number;
  statusText: string;
  data: T;
}

export interface RequestConfig extends AxiosRequestConfig {
  globalHandler?: boolean;
  isOData?: boolean;
}

export interface IHttpClient {
  get: <T>(url: string, config?: RequestConfig) => Promise<T>;
  post: <T>(url: string, data?: any, config?: RequestConfig) => Promise<T>;
  patch: <T>(url: string, data?: any, config?: RequestConfig) => Promise<T>;
  put: <T>(url: string, data?: any, config?: RequestConfig) => Promise<T>;
  delete: <T>(url: string, config?: RequestConfig) => Promise<T>;
  setHeadersLanguage(lang: string): void;
}

class HttpClient implements IHttpClient {
  private axios: AxiosInstance;

  constructor() {
    this.axios = axios.create({
      baseURL: process.env.VUE_APP_API_BASE_URL,
      withCredentials: true,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    this.axios.interceptors.request.use(
      (request) => this.requestHandler(request),
    );

    this.axios.interceptors.response.use(
      (response) => this.responseSuccessHandler(response),
      (error) => this.responseErrorHandler(error),
    );
  }

  public setHeadersLanguage(lang: string) {
    this.axios.defaults.headers.common['Accept-Language'] = lang;
  }

  // By default the global handler is ON. Need to pass { globalHandler: false } to turn in off
  private isGlobalHandlerEnabled(config = { globalHandler: true }) {
    if (config.globalHandler === undefined) return true;
    return config.globalHandler;
  }

  private responseSuccessHandler(response: any) {
    if (this.isGlobalHandlerEnabled(response.config)) {
      // Add what you want when request is successful. It is applied globally except when { globalHandler: false }
    }
    return camelCaseKeys(response, { deep: true });
  }

  private responseErrorHandler(error: any) {
    if (this.isGlobalHandlerEnabled(error.config)) {
      if (error?.response?.data) {
        const { errors } = error.response.data;
        if (errors) {
          const errorMessage = Object.keys(errors).map((key) => errors[key]);
          Vue.toasted.global.error(errorMessage);
        }
      }
    }
    return Promise.reject(error?.response?.data || error);
  }

  private requestHandler(request: any) {
    const accessToken = localStorage.getItem(localStorageKeys.accessToken.name);

    if (accessToken) {
      request.headers.common.Authorization = `Bearer ${accessToken}`;
    }

    // Add 'X-Request-ID' and 'X-Correlation-ID' headers to each request
    request.headers.common['X-Request-ID'] = uuidv4();
    request.headers.common['X-Correlation-ID'] = uuidv4();

    if (this.isGlobalHandlerEnabled(request)) {
      // Add what you want when request is sent
      // It is applied globally except when { globalHandler: false }
    }

    if (request.isOData) {
      // build OData search query and remove the '?' that is added by the query building library at the beginning of the string
      request.paramsSerializer = (params: ISearchData) => buildQuery(params).slice(1);
    }

    return request;
  }

  private createErrorObject(error: AxiosError): AxiosError {
    return error;
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: IRestResponse<T> = await this.axios.get(url, config);
      return response.data;
    } catch (e) {
      throw this.createErrorObject(e);
    }
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: IRestResponse<T> = await this.axios.post(url, data, config);
      return response.data;
    } catch (e) {
      throw this.createErrorObject(e);
    }
  }

  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: IRestResponse<T> = await this.axios.patch(url, data, config);
      return response.data;
    } catch (e) {
      throw this.createErrorObject(e);
    }
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: IRestResponse<T> = await this.axios.put(url, data, config);
      return response.data;
    } catch (e) {
      throw this.createErrorObject(e);
    }
  }

  public async delete<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: IRestResponse<T> = await this.axios.delete(url, config);
      return response.data;
    } catch (e) {
      throw this.createErrorObject(e);
    }
  }
}

export const httpClient: IHttpClient = new HttpClient();
