import { IOptionSubItem } from '@libs/entities-lib/optionItem';
import {
  IFilter, IUserAccountEntity,
} from '@libs/entities-lib/user-account';
import { IDomainBaseService, IDomainBaseServiceMock } from '../../base';

export interface IAddRoleToUserRequest {
  subRole: IOptionSubItem;
  userId: uuid;
}

export interface IEditFilterRequest {
  oldFilter: IFilter;
  newFilter: IFilter;
}

export interface IUserAccountsService extends IDomainBaseService<IUserAccountEntity, uuid> {
  fetchCurrentUserAccount(): Promise<IUserAccountEntity>;
  addFilter(filter: IFilter): Promise<IUserAccountEntity>;
  editFilter(payload: IEditFilterRequest): Promise<IUserAccountEntity>;
  deleteFilter(filter: IFilter): Promise<IUserAccountEntity>;
  assignRole(payload: IAddRoleToUserRequest): Promise<IUserAccountEntity>;
}

export interface IUserAccountsServiceMock extends IDomainBaseServiceMock<IUserAccountEntity> {
  fetchCurrentUserAccount: jest.Mock<IUserAccountEntity>;
  addFilter: jest.Mock<IUserAccountEntity>;
  editFilter: jest.Mock<IUserAccountEntity>;
  deleteFilter: jest.Mock<IUserAccountEntity>;
  assignRole: jest.Mock<IUserAccountEntity>;
}
