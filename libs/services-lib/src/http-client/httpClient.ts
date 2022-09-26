/* eslint-disable @typescript-eslint/no-explicit-any */
import Vue from 'vue';
import { v4 as uuidv4 } from 'uuid';

import axios, {
  AxiosInstance, AxiosResponse,
} from 'axios';
import { camelKeys } from 'js-convert-case';
import { IAzureSearchParams, IServerError } from '@libs/shared-lib/types';
import applicationInsights from '@libs/shared-lib/plugins/applicationInsights/applicationInsights';
import { sanitize932115 } from '../utils/owasp';
import { buildQuery } from '../odata-query';

import {
  IHttpClient, IError, IRestResponse, RequestConfig, IHttpClientOptions,
} from './httpClient.types';

export class HttpClient implements IHttpClient {
  private axios: AxiosInstance;

  private i18n: any;

  private options: IHttpClientOptions;

  constructor(i18n: any, options: IHttpClientOptions = {
    authentication: false, accessTokenKey: '', redirect403Url: '', timerBeforeRedirection: 3000, useErrorReport: false,
  }) {
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

    this.i18n = i18n;
    this.options = options;
  }

  public setHeadersTenant(tenantId: string) {
    this.axios.defaults.headers.common['x-tenant-id'] = tenantId;
  }

  public getTenant(): string {
    return this.axios.defaults.headers.common['x-tenant-id'].toString();
  }

  public setHeadersLanguage(lang: string) {
    this.axios.defaults.headers.common['Accept-Language'] = lang;
  }

  public error403Handler() {
    if (this.options.redirect403Url) {
      Vue.toasted.global.error(this.i18n.t('error.access_denied'));
      const lang = window.location.pathname.split('/')[1];
      setTimeout(() => {
        window.location.href = `${window.location.origin}/${lang}/${this.options.redirect403Url}`;
      }, this.options.timerBeforeRedirection);
    }
  }

  // By default, the global handler is ON. Need to pass { globalHandler: false } to turn in off
  private isGlobalHandlerEnabled(config = { globalHandler: true }) {
    if (config.globalHandler === undefined) {
      return true;
    }
    return config.globalHandler;
  }

  private responseSuccessHandler(response: any) {
    if (this.isGlobalHandlerEnabled(response.config)) {
      // Add what you want when request is successful. It is applied globally except when { globalHandler: false }
    }
    if (response?.headers && response.headers['content-disposition']
      && response.headers['content-disposition'].toLowerCase().indexOf('attachment') > -1) {
      return response;
    }
    return camelKeys(response, { recursive: true, recursiveInArray: true }) as AxiosResponse<Record<string, unknown>>;
  }

  private async responseErrorHandler(error: any) {
    if (!error) {
      return false;
    }

    if (!error.response?.data) {
      if (this.options.useErrorReport) {
        Vue.prototype.$reportToasted(this.i18n.t('error.unexpected_error'), error);
      } else {
        Vue.toasted.global.error(this.i18n.t('error.unexpected_error'));
      }
    }

    if (error.response?.status === 401) {
      Vue?.toasted?.global.error(this.i18n.t('error.log_in_again'));
      return false;
    }

    if (error.response?.status === 403 && this.isGlobalHandlerEnabled(error.config)) {
      this.error403Handler();
      return false;
    }

    const errors = error.response?.data?.errors;
    if (errors) {
      this.logToAppInsights(errors, error);
    }

    if (this.isGlobalHandlerEnabled(error.config)) {
      this.errorGlobalHandler(error);
    } else {
      return Promise.reject(error);
    }
    return false;
  }

  private errorGlobalHandler(e: IServerError) {
    const errorData = e.response?.data?.errors;
    if (errorData && Array.isArray(errorData)) {
      errorData.forEach((error: IError) => {
        const formattedError = this.getFormattedError(error);

        if (this.options.useErrorReport && !formattedError) {
          Vue.prototype.$reportToasted('error.unexpected_error', e);
        } else {
          Vue.toasted.global.error(formattedError);
        }
      });
    } else if (this.options.useErrorReport) {
      Vue.prototype.$reportToasted(this.i18n.t('error.unexpected_error'), e);
    } else {
      Vue.toasted.global.error(this.i18n.t('error.unexpected_error'));
    }
  }

  private logToAppInsights(errors: any, error: any) {
    if (!error.response || error.config?.noErrorLogging) {
      return;
    }
    // we'll consider an error with a "errors" prop as a validation error from the BE and thus only trace those
    // except 404 errors which we will consider errors
    // we remove guids from the error name so as to merge similar errors
    const regexGuid = /[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}/gi;
    const urlWithoutGuids = (error.response?.config?.url || '').replace(regexGuid, 'GUID');
    const errorName = `${urlWithoutGuids} http error ${error.response.status}`;
    const errorDetails = { error: errors || error, failedMethod: error.response.config?.method, failedRequestUrl: error.response.config?.url };
    if (errors && Array.isArray(errors) && error.response.status !== 404) {
      applicationInsights.trackTrace(errorName, errorDetails, 'httpClient', error.response.config?.method);
    } else {
      applicationInsights.trackException(errorName, errorDetails, 'httpClient', error.response.config?.method);
    }
  }

  private requestHandler(request: any) {
    if (this.options.authentication) {
      if (!request.ignoreJwt) {
        const accessToken = localStorage.getItem(this.options.accessTokenKey);
        if (accessToken) {
          request.headers.common.Authorization = `Bearer ${accessToken}`;
        }
      }
    }
    // Add 'X-Request-ID' and 'X-Correlation-ID' headers to each request
    request.headers.common['X-Request-ID'] = uuidv4();
    request.headers.common['X-Correlation-ID'] = uuidv4();

    if (this.isGlobalHandlerEnabled(request)) {
      // Add what you want when request is sent
      // It is applied globally except when { globalHandler: false }
    }

    sanitize932115(request.data);

    if (request.isOData) {
      // build OData search query and remove the '?' that is added by the query building library at the beginning of the string
      request.paramsSerializer = this.serializeParams;
    }
    return request;
  }

  private serializeParams(params: IAzureSearchParams) {
    return buildQuery(params).slice(1).replace('$search', 'search');
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

  public getFormattedError(error: IError): string {
    /*
      expected error object looks like this
      error.meta: Record<string, string | IMultilingual>

      so it could be this:
      error.meta = { 'PaymentModality' :{ translation: {'en': 'my english value', 'fr': 'en francais c toujours mieux'} }}
      or
      error.meta = { 'MaxValue' : '128'}

      with a lokalise text that would be something like 'This is my {PaymentModality}'
    */

    // take error.code if we have it translated...
    let text = (this.i18n.te(error.code) ? this.i18n.t(error.code) : this.i18n.t(`${error.title || error.code}`)) as string;
    let locale = this.i18n.locale;

    if (locale !== 'en' && locale !== 'fr') {
      locale = 'en';
    }

    if (error.meta) {
      for (let i = 0; i < Object.keys(error.meta).length; i += 1) {
        const key = Object.keys(error.meta)[i];
        const val = error.meta[key];
        if (typeof (val) !== 'object') {
          // if it's a string, replace it directly
          text = text.replace(new RegExp(`{${key}}`, 'gi'), val);
        } else {
          // if it's a multilingual, we use the translation
          text = text.replace(new RegExp(`{${key}}`, 'gi'), (val && val.translation && val.translation[locale]) || '');
        }
      }
    }
    return text;
  }
}
