import { IMultilingual } from './IMultilingual';

interface IError {
  status: string,
  code: string,
  title: string,
  detail: string,
  meta: Record<string, string | IMultilingual>
}

export interface IServerError extends Error {
  request?: { responseURL: string },
  response?: {
    data?: { errors: IError[] },
    status?: number,
    config?: { data: string }
  }
}
