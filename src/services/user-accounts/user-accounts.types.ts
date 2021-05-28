import { IOptionSubItem } from '@/entities/optionItem';
import { IUserAccountData, IUserAccountSearchData } from '@/entities/user-account';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';

export interface IAddRoleToUserRequest {
  subRole: IOptionSubItem;
  userId: uuid;
}

export interface IUserAccountsService {
  searchUserAccounts(params: IAzureSearchParams): Promise<IAzureSearchResult<IUserAccountSearchData>>;
  fetchAllUserAccounts(): Promise<IAzureSearchResult<IUserAccountSearchData>>;
  addRoleToUser(payload: IAddRoleToUserRequest): Promise<IUserAccountData>;
  deleteUserAccount(userId: string):void;
}

export interface IUserAccountsServiceMock {
  searchUserAccounts: jest.Mock <IAzureSearchResult<IUserAccountSearchData>>;
  fetchAllUserAccounts: jest.Mock <IAzureSearchResult<IUserAccountSearchData>>;
  addRoleToUser: jest.Mock<IUserAccountData>;
  deleteUserAccount: jest.Mock<string>;
}
