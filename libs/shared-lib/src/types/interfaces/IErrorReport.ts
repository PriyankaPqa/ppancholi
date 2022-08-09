import { IUser } from '@libs/entities-lib/user';

export interface IErrorReport {
  id?: string,
  user?: IUser,
  timestamp?: string,
  api?: string,
  status?: string,
  errorResponse?: string | unknown,
  payload?: string | unknown,
  description?: string,
  appUrl?: string,
  tenantId?: string,
  languageCode?: string,
  details?: string,
}
