import { IOptionSubItem } from '@libs/entities-lib/optionItem';
import {
  IFilter, IUserAccountEntity, IUserAccountMetadata, IUserProfileQueryResponse,
} from '@libs/entities-lib/user-account';
import { IDomainBaseService, IDomainBaseServiceMock } from '../../base';

export interface ICreateUserRequest {
  emailAddress: string;
  givenName: string;
  surname: string;
  roleId: uuid;
}

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
  createUserAccount(payload: ICreateUserRequest): Promise<IUserAccountEntity>;
  fetchByEventAndRole(targetEvent: uuid, targetRoles: Array<uuid>): Promise<IUserAccountMetadata[]>;
  searchDirectoryUsers(searchTerm: string): Promise<IUserProfileQueryResponse[]>;
}

export interface IUserAccountsServiceMock extends IDomainBaseServiceMock<IUserAccountEntity> {
  fetchCurrentUserAccount: jest.Mock<IUserAccountEntity>;
  addFilter: jest.Mock<IUserAccountEntity>;
  editFilter: jest.Mock<IUserAccountEntity>;
  deleteFilter: jest.Mock<IUserAccountEntity>;
  assignRole: jest.Mock<IUserAccountEntity>;
  createUserAccount: jest.Mock<IUserAccountEntity>;
  fetchByEventAndRole: jest.Mock<IUserAccountMetadata[]>;
  searchDirectoryUsers: jest.Mock<IUserProfileQueryResponse[]>;
}
