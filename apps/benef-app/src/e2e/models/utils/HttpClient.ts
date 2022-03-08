/* eslint-disable */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { config } from 'dotenv';
import Authentication from './Authentication';

config({ path: '.env.staging' });

export interface IRestResponse<T> {
    headers?: any;
    success: boolean;
    status: number;
    statusText: string;
    data: T;
}

export interface IHttpClient {
    getFullResponse: <T>(url: string, config?: AxiosRequestConfig) => Promise<IRestResponse<T>>;
    postFullResponse: <T>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<IRestResponse<T>>;
    get: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>;
    post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>;
    patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>;
    put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>;
    delete: <T>(url: string, data?: any) => Promise<T>;
}

export class HttpClient {
    private axios: AxiosInstance;

    constructor() {
      this.axios = axios.create({
        baseURL: `${process.env.VUE_APP_API_BASE_URL}/`,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      this.axios.interceptors.request.use(
        (request) => this.requestHandler(request),
      );
    }

    private requestHandler(request: any) {
      const { accessToken } = Authentication;
      if (accessToken) {
        request.headers.common.Authorization = `Bearer ${accessToken}`;
      }
      return request;
    }

    public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
      return (await this.getFullResponse<T>(url, config))?.data;
    }

    public async getFullResponse<T>(url: string, config?: AxiosRequestConfig): Promise<IRestResponse<T>> {
      const response: IRestResponse<T> = await this.axios.get(url, config);
      return response;
    }

    public async postFullResponse<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<IRestResponse<T>> {
      const response: IRestResponse<T> = await this.axios.post(url, data, config);
      return response;
    }

    public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
      const response: IRestResponse<T> = await this.axios.post(url, data, config);
      return response.data;
    }

    public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
      const response: IRestResponse<T> = await this.axios.patch(url, data, config);
      return response.data;
    }

    public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
      const response: IRestResponse<T> = await this.axios.put(url, data, config);
      return response.data;
    }

    public async delete<T>(url: string, data?: any): Promise<T> {
      const response: IRestResponse<T> = await this.axios.delete(url, data);
      return response.data;
    }
}

export const httpClient = new HttpClient();
