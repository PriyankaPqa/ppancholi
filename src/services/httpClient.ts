/* eslint-disable @typescript-eslint/no-explicit-any */
import Vue from 'vue';
import { v4 as uuidv4 } from 'uuid';
import axios, {
  AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse,
} from 'axios';
import { camelKeys } from 'js-convert-case';
import buildQuery from '@/services/odata-query';
import { localStorageKeys } from '@/constants/localStorage';
import { IAzureSearchParams, IMultilingual } from '@/types';
import { i18n } from '@/ui/plugins/i18n';
import routes from '@/constants/routes';

export interface IRestResponse<T> {
  headers?: any;
  success: boolean;
  status: number;
  statusText: string;
  data: T;
}

export interface RequestConfig extends AxiosRequestConfig {
  globalHandler?: boolean;
  isOData?: boolean;
  containsEncodedURL?: boolean;
}

export interface IError {
  status: string,
  code: string,
  title: string,
  detail: string,
  meta: Record<string, string | IMultilingual>
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

class HttpClient implements IHttpClient {
  private axios: AxiosInstance;

  private reloadTimeout = null as NodeJS.Timeout;

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
    if (response?.headers && response.headers['content-disposition']
      && response.headers['content-disposition'].toLowerCase().indexOf('attachment') > -1) return response;
    return camelKeys(response, { recursive: true, recursiveInArray: true }) as AxiosResponse<Record<string, unknown>>;
  }

  private async error401Handler() {
    Vue.toasted.global.warning(i18n.t('error.401.refresh'));

    try {
      const last401Redirect = localStorage.getItem(localStorageKeys.last401Redirect.name);

      // so not to loop the user indefinitely, if he had been redirected already in the last 30 seconds we wont
      if (!last401Redirect || Number.isNaN(new Date(last401Redirect).getTime())
        || Math.abs(new Date().getTime() - new Date(last401Redirect).getTime()) > 30000) {
        localStorage.setItem(localStorageKeys.last401Redirect.name, (new Date()).toISOString());
        this.reloadTimeout = setTimeout(() => {
          this.reloadTimeout = null;
          window.location.reload();
        }, 4000);
      } else if (!this.reloadTimeout && !window.location.href.endsWith(routes.loginError.path)) {
        // if we just tried but it didnt work, try to send them to logout page...
        setTimeout(() => {
          window.location.href = routes.loginError.path;
        }, 4000);
      }
    } catch (error) {
      if (!window.location.href.endsWith(routes.loginError.path)) {
        setTimeout(() => {
          window.location.href = routes.loginError.path;
        }, 4000);
      }
    }
  }

  private async responseErrorHandler(error: any) {
    if (!error || !error.response) return false;

    if (error.response.status === 401) {
      await this.error401Handler();
      return false;
    }

    const { errors } = error.response.data;
    if (this.isGlobalHandlerEnabled(error.config)) {
      if (errors && Array.isArray(errors)) {
        errors.forEach((error: IError) => {
          Vue.toasted.global.error(this.getFormattedError(error));
        });
      } else {
        Vue.toasted.global.error(i18n.t('error.unexpected_error'));
      }
    } else {
      return Promise.reject(errors || error);
    }
    return false;
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
      request.paramsSerializer = (params: IAzureSearchParams) => {
        const odataParams = buildQuery(params).slice(1);
        return odataParams.replace('$search', 'search');
      };
    }
    return request;
  }

  private createErrorObject(error: any): AxiosError {
    return error;
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return (await this.getFullResponse<T>(url, config))?.data;
  }

  public async getFullResponse<T>(url: string, config?: AxiosRequestConfig): Promise<IRestResponse<T>> {
    try {
      const response: IRestResponse<T> = await this.axios.get(url, config);
      return response;
    } catch (e) {
      throw this.createErrorObject(e);
    }
  }

  public async postFullResponse<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<IRestResponse<T>> {
    try {
      const response: IRestResponse<T> = await this.axios.post(url, data, config);
      return response;
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

  public async delete<T>(url: string, data?: any): Promise<T> {
    try {
      const response: IRestResponse<T> = await this.axios.delete(url, data);
      return response.data;
    } catch (e) {
      throw this.createErrorObject(e);
    }
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
    let text = (i18n.te(error.code) ? i18n.t(error.code) : i18n.t(`${error.title || error.code}`)) as string;
    let { locale } = i18n;

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

export const httpClient: IHttpClient = new HttpClient();
