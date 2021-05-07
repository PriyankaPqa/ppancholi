import { IMultilingual } from '@/types';
import { IFilter } from '@/entities/user';

export enum EUserAccountStatus {
  Active = 1,
  Inactive = 2
}
export interface IUserAccountData {
  id: uuid;
  tenantId: uuid;
  created: string;
  timestamp: string;
  status: 1 | 2;
  eTag: string;
  filters: IFilter[]
}

export interface IUserAccountSearchData {
  userAccountId: uuid;
  givenName: string;
  surname: string;
  displayName: string;
  emailAddress: string;
  phoneNumber: string;
  roleId: uuid;
  roleName: IMultilingual;
  userAccountStatus: EUserAccountStatus;
  filters: Array<IFilter>;
  tenantId: uuid;
  teamCount: number;
  caseFilesCount: number;
  openCaseFilesCount: number;
  inactiveCaseFilesCount: number;
}

export interface IUserAccount {
  id: uuid;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phoneNumber: string;
  roleId: uuid;
  roleName: IMultilingual;
  accountStatus: EUserAccountStatus;
  filters: Array<IFilter>;
  tenantId: uuid;

  teamCount: number;
  caseFilesCount: number;
  openCaseFilesCount: number;
  inactiveCaseFilesCount: number;
}
