import { IError } from '../../../../services-lib/src/http-client/httpClient.types';

export interface IServerError extends Error {
  request?: { responseURL: string},
  response?: {
    data?: {errors: IError[]},
    status?: string,
    config?: { data: string}
  }
}
