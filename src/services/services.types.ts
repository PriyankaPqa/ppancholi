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
  get:(url: string, request?: IHttpClientRequest) => Promise<IRestResponse>;
  put:(url: string, data?: any, request?: IHttpClientRequest) => Promise<IRestResponse>;
  patch:(url: string, data?: any, request?: IHttpClientRequest) => Promise<IRestResponse>;
  post:(url: string, data?: any, request?: IHttpClientRequest) => Promise<IRestResponse>;
  delete:(url: string, data?: any, request?: IHttpClientRequest) => Promise<IRestResponse>;
}

export interface IHttpError {
 message: string;
 response: {
   status: number;
 }
}
