import {
  IUserAccountData, IFilter,
} from '@/entities/user';

export interface IEditFilterRequest {
  oldFilter: IFilter;
  newFilter: IFilter;
}

export interface IDeleteFilterRequest {
  deleteFilter: IFilter;
}

export interface IUsersService {
  fetchUser(): Promise<IUserAccountData>;
  createFilter(filter: IFilter): Promise<IUserAccountData>;
  updateFilter(payload: IEditFilterRequest): Promise<IUserAccountData>;
  removeFilter(filter: IDeleteFilterRequest): Promise<IUserAccountData>;
}

export interface IUsersServiceMock {
  fetchUser: jest.Mock <IUserAccountData>;
  createFilter: jest.Mock <IUserAccountData>;
  updateFilter: jest.Mock <IUserAccountData>;
  removeFilter: jest.Mock <IUserAccountData>;
}
