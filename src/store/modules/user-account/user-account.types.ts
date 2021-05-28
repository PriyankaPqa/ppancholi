import { IUserAccountSearchData } from '@/entities/user-account';

export interface IState {
  userAccounts: IUserAccountSearchData[],
  searchLoading: boolean,
}
