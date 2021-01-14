/* eslint-disable */
import { IRestResponse } from '@/types';

export interface IHttpClientRequest {
  headers?: any;
  params?: any;
  data?: any;
  globalHandler?: boolean;
  sendTokenAndRole?: boolean;
}

export interface IHttpClient {
  get:(url: string, request?: IHttpClientRequest) => Promise<IRestResponse<unknown>>;
  put:(url: string, data?: any, request?: IHttpClientRequest) => Promise<IRestResponse<unknown>>;
  patch:(url: string, data?: any, request?: IHttpClientRequest) => Promise<IRestResponse<unknown>>;
  post:(url: string, data?: any, request?: IHttpClientRequest) => Promise<IRestResponse<unknown>>;
  delete:(url: string, data?: any, request?: IHttpClientRequest) => Promise<IRestResponse<unknown>>;
}

export interface IHttpError {
 message: string;
 response: {
   status: number;
 }
}
