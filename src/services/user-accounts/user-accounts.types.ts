import { IUserAccountData, IUserAccountSearchData } from '@/entities/user-account';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';

export interface IAddRoleToUserRequest {
  roleId: uuid;
  userId: uuid;
}
export interface IUserAccountsService {
  searchUserAccounts(params: IAzureSearchParams): Promise<IAzureSearchResult<IUserAccountSearchData>>;
  addRoleToUser(payload: IAddRoleToUserRequest): Promise<IUserAccountData>;
}

export interface IUserAccountsServiceMock {
  searchUserAccounts: jest.Mock <IAzureSearchResult<IUserAccountSearchData>>;
  addRoleToUser: jest.Mock<IUserAccountData>;
}
