import { IRestResponse } from '@/types';
import { IHttpError } from '@/services';

export default {
  responseBuilder: <T>(response: IRestResponse<T>): IRestResponse<T> => ({
    success: true,
    status: response.status,
    statusText: response.statusText,
    data: response.data,
  }),

  createErrorObject: <T>(error: IHttpError): IRestResponse<T> => ({
    success: false,
    status: error.response !== undefined ? error.response.status : 0,
    statusText: error.message,
    data: null,
  }),
};
