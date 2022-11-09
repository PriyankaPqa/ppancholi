import { IOptionItem } from '@libs/entities-lib/optionItem';
import {
  FilterKey, IFilter, IUserAccountEntity, IUserAccountMetadata,
} from '@libs/entities-lib/user-account';
import {
  IBaseActions,
  IBaseGetters,
  IBaseMutations,
  IBaseActionsMock,
  IBaseGettersMock,
  IBaseMutationsMock,
} from '@/storage/base/base.types';
import { IAddRoleToUserRequest } from '@libs/services-lib/user-accounts/entity';
import { IMultilingual } from '@libs/shared-lib/types';
import { Status } from '@libs/entities-lib/base';

export interface IActions extends IBaseActions<IUserAccountEntity, IUserAccountMetadata, uuid> {
  addFilter(filter: IFilter): Promise<IUserAccountEntity>;
  editFilter(oldFilter: IFilter, newFilter: IFilter): Promise<IUserAccountEntity>;
  deleteFilter(filter: IFilter): Promise<IUserAccountEntity>;
  assignRole(payload: IAddRoleToUserRequest): Promise<IUserAccountEntity>;
  fetchCurrentUserAccount(): Promise<IUserAccountEntity>;
  fetchRoles(): Promise<IOptionItem[]>;
}

export interface IActionsMock extends IBaseActionsMock<IUserAccountEntity, IUserAccountMetadata> {
  addFilter: jest.Mock<IUserAccountEntity>
  editFilter: jest.Mock<IUserAccountEntity>
  deleteFilter: jest.Mock<IUserAccountEntity>
  assignRole: jest.Mock<IUserAccountEntity>
  fetchCurrentUserAccount: jest.Mock<IUserAccountEntity>
  fetchRoles: jest.Mock<IOptionItem[]>;
}

export interface IGetters extends IBaseGetters<IUserAccountEntity, IUserAccountMetadata> {
  currentUserFiltersByKey(key: FilterKey): IFilter[];
  roles(): IOptionItem[];
  rolesByLevels(levels?: Array<string>): {name: IMultilingual, id: string, status: Status}[];
}

export interface IGettersMock extends IBaseGettersMock<IUserAccountEntity, IUserAccountMetadata> {
  currentUserFiltersByKey: jest.Mock<IFilter[]>,
  roles: jest.Mock<IOptionItem[]>,
  rolesByLevels: jest.Mock<{name: IMultilingual, id: string, status: Status}[]>,
}

export interface IMutations extends IBaseMutations<IUserAccountEntity, IUserAccountMetadata> {
 setCurrentUserAccount(payload: IUserAccountEntity): void;
 setRolesFetched(payload: boolean): void;
}

export interface IMutationsMock extends IBaseMutationsMock<IUserAccountEntity, IUserAccountMetadata> {
  setCurrentUserAccount: jest.Mock<void>
  setRolesFetched: jest.Mock<void>
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
