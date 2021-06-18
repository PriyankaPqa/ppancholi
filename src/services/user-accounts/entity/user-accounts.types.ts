import { IOptionSubItem } from '@/entities/optionItem';
import {
  IFilter, IUserAccountEntity,
} from '@/entities/user-account';
import { IDomainBaseService, IDomainBaseServiceMock } from '@/services/base';

export interface IAddRoleToUserRequest {
  subRole: IOptionSubItem;
  userId: uuid;
}

export interface IEditFilterRequest {
  oldFilter: IFilter;
  newFilter: IFilter;
}

export interface IUserAccountsService extends IDomainBaseService<IUserAccountEntity>{
  fetchCurrentUserAccount(): Promise<IUserAccountEntity>;
  addFilter(filter: IFilter): Promise<IUserAccountEntity>;
  editFilter(payload: IEditFilterRequest): Promise<IUserAccountEntity>;
  deleteFilter(filter: IFilter): Promise<IUserAccountEntity>;
  assignRole(payload: IAddRoleToUserRequest): Promise<IUserAccountEntity>;
  setUserPreferredLanguage(id: uuid, languageCode: string): Promise<IUserAccountEntity>;
  setCurrentUserPreferredLanguage(languageCode: string): Promise<IUserAccountEntity>;
}

export interface IUserAccountsServiceMock extends IDomainBaseServiceMock<IUserAccountEntity> {
  fetchCurrentUserAccount: jest.Mock<IUserAccountEntity>;
  addFilter: jest.Mock<IUserAccountEntity>;
  editFilter: jest.Mock<IUserAccountEntity>;
  deleteFilter: jest.Mock<IUserAccountEntity>;
  assignRole: jest.Mock<IUserAccountEntity>;
  setUserPreferredLanguage: jest.Mock<IUserAccountEntity>;
  setCurrentUserPreferredLanguage: jest.Mock<IUserAccountEntity>;
}
