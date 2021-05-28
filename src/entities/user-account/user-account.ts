import { IMultilingual } from '@/types';
import { IFilter } from '@/entities/user';
import utils from '../utils';
import {
  EUserAccountStatus, EAccountStatus, IUserAccount, IUserAccountSearchData,
} from './user-account.types';

export const NO_ROLE = 'no_role';

export class UserAccount implements IUserAccount {
  id: string;

  firstName: string;

  lastName: string;

  displayName: string;

  email: string;

  phoneNumber: string;

  roleId: uuid;

  roleName: IMultilingual;

  accountStatus: EAccountStatus;

  status: EUserAccountStatus;

  filters: Array<IFilter>;

  tenantId: string;

  teamCount: number;

  caseFilesCount: number;

  openCaseFilesCount: number;

  inactiveCaseFilesCount: number;

  constructor(data: IUserAccountSearchData) {
    this.id = data.userAccountId;
    this.email = data.emailAddress;
    this.phoneNumber = data.phoneNumber;
    this.accountStatus = data.accountStatus;
    this.status = data.userAccountStatus; // Do not confuse the FE/BE status names
    this.firstName = data.givenName;
    this.lastName = data.surname;
    this.displayName = data.displayName;
    this.roleId = data.roleId;
    this.roleName = utils.initMultilingualAttributes(data.roleName);
    this.filters = data.filters ? data.filters : [];
    this.tenantId = data.tenantId;
    this.teamCount = data.teamCount;
    this.caseFilesCount = data.caseFilesCount;
    this.openCaseFilesCount = data.openCaseFilesCount;
    this.inactiveCaseFilesCount = data.inactiveCaseFilesCount;
  }
}
