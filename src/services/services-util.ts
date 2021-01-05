import { IRestResponse } from '@/types';
import { IHttpError } from '@/services';

export default {
  responseBuilder: (response: IRestResponse) => ({
    success: true,
    status: response.status,
    statusText: response.statusText,
    data: response.data,
  }),
  createErrorObject: (error: IHttpError): IRestResponse => ({
    success: false,
    status: error.response !== undefined ? error.response.status : 0,
    statusText: error.message,
    data: null,
  }),
};
