import { IUserAccountSearchData } from '@/entities/user-account';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';

export interface IUserAccountsService {
  searchUserAccounts(params: IAzureSearchParams): Promise<IAzureSearchResult<IUserAccountSearchData>>
}

export interface IUserAccountsServiceMock {
  searchUserAccounts: jest.Mock <IAzureSearchResult<IUserAccountSearchData>>;
}
