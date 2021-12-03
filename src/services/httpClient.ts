/* eslint-disable @typescript-eslint/no-explicit-any */
import { ISearchData } from '@/types';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import applicationInsights from '@crctech/registration-lib/src/plugins/applicationInsights/applicationInsights';
import buildQuery from 'odata-query';
import camelCaseKeys from 'camelcase-keys';
import { v4 as uuidv4 } from 'uuid';
import Vue from 'vue';
import { i18n } from '@/ui/plugins/i18n';
import helpers from '@/ui/helpers';

export interface IRestResponse<T> {
  success: boolean;
  status: number;
  statusText: string;
  data: T;
}

export interface IError {
  status: string,
  code: string,
  title: string,
  detail: string,
  meta: Record<string, string>
}

export interface RequestConfig extends AxiosRequestConfig {
  globalHandler?: boolean;
  noErrorLogging?: boolean;
  isOData?: boolean;
  containsEncodedURL?: boolean;
}

export interface IHttpClient {
  getFullResponse: <T>(url: string, config?: RequestConfig) => Promise<IRestResponse<T>>;
  postFullResponse: <T>(url: string, data?: any, config?: RequestConfig) => Promise<IRestResponse<T>>;
  get: <T>(url: string, config?: RequestConfig) => Promise<T>;
  post: <T>(url: string, data?: any, config?: RequestConfig) => Promise<T>;
  patch: <T>(url: string, data?: any, config?: RequestConfig) => Promise<T>;
  put: <T>(url: string, data?: any, config?: RequestConfig) => Promise<T>;
  delete: <T>(url: string, config?: RequestConfig) => Promise<T>;
  setHeadersLanguage(lang: string): void;
  setHeadersTenant(tenantId: string): void;
}

export class HttpClient implements IHttpClient {
  private axios: AxiosInstance;

  constructor() {
    this.axios = axios.create({
      baseURL: `${process.env.VUE_APP_API_BASE_URL}/`,
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

  public setHeadersTenant(tenantId: string) {
    this.axios.defaults.headers.common['x-tenant-id'] = tenantId;
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
    const { errors } = error.response.data;

    this.logToAppInsights(errors, error);

    if (this.isGlobalHandlerEnabled(error.config)) {
      if (errors && Array.isArray(errors)) {
        errors.forEach((error: IError) => {
          Vue.toasted.global.error(i18n.t(`${error.code}`));
        });
      } else {
        Vue.toasted.global.error(i18n.t('error.unexpected_error'));
      }
    } else {
      return Promise.reject(errors || error);
    }
    return false;
  }

  private logToAppInsights(errors: any, error: any) {
    if (error.config?.noErrorLogging) {
      return;
    }
    // we'll consider an error with a "errors" prop as a validation error from the BE and thus only trace those
    // except 404 errors which we will consider errors
    // we remove guids from the error name so as to merge similar errors
    const regexGuid = /[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}/gi;
    const urlWithoutGuids = (error.response.config?.url || '').replace(regexGuid, 'GUID');
    const errorName = `${urlWithoutGuids} http error ${error.response.status}`;
    const errorDetails = { error: errors || error, failedMethod: error.response.config?.method, failedRequestUrl: error.response.config?.url };
    if (errors && Array.isArray(errors) && error.response.status !== 404) {
      applicationInsights.trackTrace(errorName, errorDetails, 'httpClient', error.response.config?.method);
    } else {
      applicationInsights.trackException(errorName, errorDetails, 'httpClient', error.response.config?.method);
    }
  }

  private requestHandler(request: any) {
    // Add 'X-Request-ID' and 'X-Correlation-ID' headers to each request
    request.headers.common['X-Request-ID'] = uuidv4();
    request.headers.common['X-Correlation-ID'] = uuidv4();

    if (this.isGlobalHandlerEnabled(request)) {
      // Add what you want when request is sent
      // It is applied globally except when { globalHandler: false }
    }

    // The registration link might contain characters that need encoding, which should not be handled by the default axios paramsSerializer
    // because it encodes them in a manner that's not consistent with the way the back-end encodes these characters.
    // In order to keep the encoding consistency back-end/front-end, the registration link will be encoded in a custom manner by the same helper that encodes
    // the event name into the registration link when the event is created
    if (request.containsEncodedURL) {
      request.paramsSerializer = (params: Record<string, string>) => helpers.objectToQueryString(params);
    }

    if (request.isOData) {
      // build OData search query and remove the '?' that is added by the query building library at the beginning of the string
      request.paramsSerializer = (params: ISearchData) => buildQuery(params).slice(1);
    }

    return request;
  }

  public async get<T>(url: string, config?: RequestConfig): Promise<T> {
    return (await this.getFullResponse<T>(url, config))?.data;
  }

  public async getFullResponse<T>(url: string, config?: RequestConfig): Promise<IRestResponse<T>> {
    const response: IRestResponse<T> = await this.axios.get(url, config);
    return response;
  }

  public async postFullResponse<T>(url: string, data?: any, config?: RequestConfig): Promise<IRestResponse<T>> {
    const response: IRestResponse<T> = await this.axios.post(url, data, config);
    return response;
  }

  public async post<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    const response: IRestResponse<T> = await this.axios.post(url, data, config);
    return response.data;
  }

  public async patch<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    const response: IRestResponse<T> = await this.axios.patch(url, data, config);
    return response.data;
  }

  public async put<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    const response: IRestResponse<T> = await this.axios.put(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, data?: any): Promise<T> {
    const response: IRestResponse<T> = await this.axios.delete(url, data);
    return response.data;
  }
}

export const httpClient: IHttpClient = new HttpClient();
