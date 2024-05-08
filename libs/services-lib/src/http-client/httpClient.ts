/* eslint-disable @typescript-eslint/no-explicit-any */
import Vue from 'vue';
import { v4 as uuidv4 } from 'uuid';

import axios, {
  AxiosInstance, AxiosResponse,
} from 'axios';
import { camelKeys } from 'js-convert-case';
import { IAzureSearchParams, IServerError } from '@libs/shared-lib/types';
import applicationInsights from '@libs/shared-lib/plugins/applicationInsights/applicationInsights';
import { localStorageKeys } from '@libs/shared-lib/constants/localStorage';
// for sql search we use the updated version of original package Odata-query V7.0.6
import { buildQuerySql } from '../odata-query-sql';
import { GlobalHandler,
  IHttpClient, IError, IRestResponse, RequestConfig, IHttpClientOptions,
} from './httpClient.types';
import { sanitize932115 } from '../utils/owasp';
// for azure search
import { buildQuery } from '../odata-query';

export class HttpClient implements IHttpClient {
  private axios: AxiosInstance;

  private i18n: any;

  private options: IHttpClientOptions;

  public baseUrl: string;

  private localBaseUrl: string;

  private localApiPortMap: string;

  constructor(i18n: any, options: IHttpClientOptions) {
    this.axios = axios.create({
      baseURL: options.baseUrl,
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
    this.baseUrl = options.baseUrl;
    this.localBaseUrl = options.localBaseUrl;
    this.localApiPortMap = options.localApiPortMap;
  }

  public setHeadersTenant(tenantId: string) {
    this.axios.defaults.headers['x-tenant-id'] = tenantId;
  }

  public setPublicToken(token: string) {
    this.axios.defaults.headers['x-public-token'] = token;
  }

  public getTenant(): string {
    return this.axios.defaults.headers['x-tenant-id'].toString();
  }

  public setHeadersLanguage(lang: string) {
    this.axios.defaults.headers['Accept-Language'] = lang;
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

  // By default, the global handler is Enabled. Need to pass { globalHandler: GlobalHandler.Partial or Disabled } to turn in off
  private getGlobalHandler(config = { globalHandler: GlobalHandler.Enabled }) {
    if (config.globalHandler === undefined) {
      return GlobalHandler.Enabled;
    }
    return config.globalHandler;
  }

  private responseSuccessHandler(response: any) {
    if (this.getGlobalHandler(response.config) === GlobalHandler.Enabled) {
      // Add what you want when request is successful. It is applied globally except when { globalHandler: GlobalHandler.Partial or Disabled }
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

    if (this.getGlobalHandler(error.config) === GlobalHandler.Disabled) {
      return Promise.reject(error);
    }

    if (!error.response?.data) {
      if (this.options.useErrorReport) {
        Vue.prototype.$reportToasted(this.i18n.t('error.unexpected_error'), error);
      } else {
        Vue?.toasted?.global.error(this.i18n.t('error.unexpected_error'));
      }
    }

    if (error.response?.status === 401) {
      Vue?.toasted?.global.error(this.i18n.t('error.log_in_again'));
      return false;
    }

    if (error.response?.status === 403 && this.getGlobalHandler(error.config) === GlobalHandler.Enabled) {
      this.error403Handler();
      return false;
    }

    const errors = error.response?.data?.errors;
    if (errors) {
      this.logToAppInsights(errors, error);
    }

    if (this.getGlobalHandler(error.config) === GlobalHandler.Enabled) {
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
    this.mapRequestForLocalhost(request, this.localApiPortMap);

    if (this.options.authentication) {
      if (!request.ignoreJwt) {
        const accessToken = this.options.accessToken || localStorage.getItem(localStorageKeys.accessToken.name);
        if (accessToken) {
          request.headers.Authorization = `Bearer ${accessToken}`;
        }
      }
    }
    // Add 'X-Request-ID' and 'X-Correlation-ID' headers to each request
    request.headers['X-Request-ID'] = uuidv4();
    request.headers['X-Correlation-ID'] = uuidv4();

    if (this.getGlobalHandler(request) === GlobalHandler.Enabled) {
      // Add what you want when request is sent
      // It is applied globally except when { globalHandler: GlobalHandler.Partial or Disabled}
    }

    sanitize932115(request.data);

    if (request.isOData || request.isODataSql) {
      request.paramsSerializer = {
        serialize: request.isODataSql ? this.serializeParamsSql : this.serializeParams,
      };
    }
    return request;
  }

  private serializeParams(params: IAzureSearchParams) {
    return buildQuery(params).slice(1).replace('$search', 'search');
  }

  private serializeParamsSql(params: IAzureSearchParams) {
    return buildQuerySql(params as any).slice(1);
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

  public getRestResponseAsFile(response: IRestResponse<BlobPart>, saveDownloadedFile = false, fileName: string = null) : string {
    const blob = response.headers && response.headers['content-type']
      ? new Blob([response.data], { type: response.headers['content-type'] }) : new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    if (saveDownloadedFile) {
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    return url;
  }

  mapRequestForLocalhost(request: any, localhostApiPorts: string) {
    if (!localhostApiPorts || localhostApiPorts.length === 0 || !request?.baseURL || !request?.url) {
      return;
    }

    // request url may be relative or absolute, strip baseUrl if present
    const relativeUrl = request.url.startsWith(this.baseUrl)
      ? request.url.substring(this.baseUrl.length)
      : request.url;

    const urlParts = relativeUrl.split('/');
    while (urlParts.length > 0) {
      const part = urlParts[0];
      if (part === 'http:' || part === 'https:' || part === '' || part === 'localhost') {
        urlParts.shift();
      } else {
        break;
      }
    }
    if (urlParts.length === 0) {
      return;
    }

    const portAndPrefix = this.getPortAndPrefixForApiUrlSuffix(urlParts[0], localhostApiPorts);
    if (portAndPrefix[0] === 0) {
      return;
    }

    urlParts.shift();
    const baseUrl = this.localBaseUrl;

    request.baseURL = `${baseUrl}:${portAndPrefix[0]}${portAndPrefix[1]}`;
    request.url = `/${urlParts.join('/')}`;
  }

  getPortAndPrefixForApiUrlSuffix(apiUrlSuffix: string, localhostApiPorts: string): [number, string] {
    let port = 0;
    let pathPrefix = '';
    try {
      if (localhostApiPorts.length === 0) {
        return [port, pathPrefix];
      }

      const portMatch = localhostApiPorts.split(',').find((s) => s.startsWith(apiUrlSuffix));
      if (portMatch) {
        const portParts = portMatch.split(':');
        if (portParts.length > 1) {
          port = parseInt(portParts[1], 10);
        }
        if (portParts.length > 2) {
          pathPrefix = `/${portParts[2]}`;
        }
      }
    } catch {
      // ignore any errors
    }
    return [port, pathPrefix];
  }

  getPayloadAsFile(payload: any, propertyName = 'contentAsFile') {
    const json = JSON.stringify(payload);
    const blob = new Blob([json], { type: 'application/json' });
    const data = new FormData();
    data.append(propertyName, blob);
    return data;
  }
}
