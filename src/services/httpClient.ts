/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { localStorageKeys } from '@/constants/localStorage';
import { v4 as uuidv4 } from 'uuid';
import helpers from '@/ui/helpers';
import Vue from 'vue';

export interface IRestResponse<T> {
  success: boolean;
  status: number;
  statusText: string;
  data: T;
}

export interface RequestConfig extends AxiosRequestConfig {
  globalHandler: boolean;
}

export interface IHttpClient {
  get: <T>(url: string, config?: RequestConfig) => Promise<IRestResponse<T>>;
  post: <T>(url: string, data?: any, config?: RequestConfig) => Promise<IRestResponse<T>>;
  patch: <T>(url: string, data?: any, config?: RequestConfig) => Promise<IRestResponse<T>>;
  put: <T>(url: string, data?: any, config?: RequestConfig) => Promise<IRestResponse<T>>;
  delete: <T>(url: string, config?: RequestConfig) => Promise<IRestResponse<T>>;
  setHeadersLanguage(lang: string): void;
}

export interface IHttpError {
  message: string;
  response: {
    status: number;
  }
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
    return response;
  }

  private responseErrorHandler(error: any) {
    if (this.isGlobalHandlerEnabled(error.config)) {
      let errorMessage = '';
      if (error.response.data.customErrorDetailsList !== undefined) { // Display a error toast when server error occurred
        errorMessage = helpers.formatErrorMessages(error.response.data.customErrorDetailsList, error.response.data.statusCode);
      } else {
        errorMessage = error;
      }
      Vue.toasted.global.error(errorMessage);
    }
    return Promise.reject(error);
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

    return request;
  }

  private responseBuilder <T>(response: IRestResponse<T>): IRestResponse<T> {
    return {
      success: true,
      status: response.status,
      statusText: response.statusText,
      data: response.data,
    };
  }

  private createErrorObject <T>(error: IHttpError): IRestResponse<T> {
    return {
      success: false,
      status: error.response !== undefined ? error.response.status : 0,
      statusText: error.message,
      data: null,
    };
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<IRestResponse<T>> {
    try {
      const response: IRestResponse<T> = await this.axios.get(url, config);
      return this.responseBuilder(response);
    } catch (e) {
      return this.createErrorObject(e);
    }
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<IRestResponse<T>> {
    try {
      const response: IRestResponse<T> = await this.axios.post(url, data, config);
      return this.responseBuilder(response);
    } catch (e) {
      return this.createErrorObject(e);
    }
  }

  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<IRestResponse<T>> {
    try {
      const response: IRestResponse<T> = await this.axios.patch(url, data, config);
      return this.responseBuilder(response);
    } catch (e) {
      return this.createErrorObject(e);
    }
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<IRestResponse<T>> {
    try {
      const response: IRestResponse<T> = await this.axios.put(url, data, config);
      return this.responseBuilder(response);
    } catch (e) {
      return this.createErrorObject(e);
    }
  }

  public async delete<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<IRestResponse<T>> {
    try {
      const response: IRestResponse<T> = await this.axios.delete(url, config);
      return this.responseBuilder(response);
    } catch (e) {
      return this.createErrorObject(e);
    }
  }
}

export const httpClient: IHttpClient = new HttpClient();
