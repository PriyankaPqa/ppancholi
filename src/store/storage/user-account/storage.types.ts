import {
  FilterKey, IFilter, IUserAccountEntity, IUserAccountMetadata,
} from '@/entities/user-account';
import {
  IBaseActions,
  IBaseGetters,
  IBaseMutations,
  IBaseActionsMock,
  IBaseGettersMock,
  IBaseMutationsMock,
} from '@/store/storage/base/base.types';
import { IAddRoleToUserRequest } from '@/services/user-accounts/entity';

export interface IActions extends IBaseActions<IUserAccountEntity, IUserAccountMetadata> {
  addFilter(filter: IFilter): Promise<IUserAccountEntity>;
  editFilter(oldFilter: IFilter, newFilter: IFilter): Promise<IUserAccountEntity>;
  deleteFilter(filter: IFilter): Promise<IUserAccountEntity>;
  assignRole(payload: IAddRoleToUserRequest): Promise<IUserAccountEntity>;
  setUserPreferredLanguage(id: uuid, languageCode: string): Promise<IUserAccountEntity>;
  setCurrentUserPreferredLanguage(languageCode: string): Promise<IUserAccountEntity>;
  fetchCurrentUserAccount(): Promise<IUserAccountEntity>;
}

export interface IActionsMock extends IBaseActionsMock<IUserAccountEntity, IUserAccountMetadata> {
  addFilter: jest.Mock<IUserAccountEntity>
  editFilter: jest.Mock<IUserAccountEntity>
  deleteFilter: jest.Mock<IUserAccountEntity>
  assignRole: jest.Mock<IUserAccountEntity>
  setUserPreferredLanguage: jest.Mock<IUserAccountEntity>
  setCurrentUserPreferredLanguage: jest.Mock<IUserAccountEntity>
  fetchCurrentUserAccount: jest.Mock<IUserAccountEntity>
}

export interface IGetters extends IBaseGetters<IUserAccountEntity, IUserAccountMetadata> {
  currentUserFiltersByKey(key: FilterKey): IFilter[];
}

export interface IGettersMock extends IBaseGettersMock<IUserAccountEntity, IUserAccountMetadata> {
  currentUserFiltersByKey: jest.Mock<IFilter[]>,
}

export interface IMutations extends IBaseMutations<IUserAccountEntity, IUserAccountMetadata> {
 setCurrentUserAccount(payload: IUserAccountEntity): void;
}

export interface IMutationsMock extends IBaseMutationsMock<IUserAccountEntity, IUserAccountMetadata> {
  setCurrentUserAccount: jest.Mock<void>
}

export interface IStorageMake {
  getters: IGetters;
  actions: IActions;
  mutations: IMutations;
}

export interface IStorageMakeMock {
  getters: IGettersMock;
  actions: IActionsMock;
  mutations: IMutationsMock;
}

export interface IStorage {
  make(): IStorageMake
}

export interface IStorageMock {
  make(): IStorageMakeMock
}
