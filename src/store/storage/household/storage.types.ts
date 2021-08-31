import { IAddress } from '@/entities/value-objects/address';
import { IHouseholdEntity, IHouseholdMetadata } from '../../../entities/household';
import {
  IBaseActions,
  IBaseGetters,
  IBaseMutations,
  IBaseActionsMock,
  IBaseGettersMock,
  IBaseMutationsMock,
} from '../base/base.types';

export interface IActions extends IBaseActions<IHouseholdEntity, IHouseholdMetadata> {
  updateNoFixedHomeAddress (householdId: string, observation: string): Promise<IHouseholdEntity>;
  updateHomeAddress (householdId: string, address: IAddress): Promise<IHouseholdEntity>;
}

export interface IActionsMock extends IBaseActionsMock<IHouseholdEntity, IHouseholdMetadata> {
  updateNoFixedHomeAddress: jest.Mock<IHouseholdEntity>;
  updateHomeAddress: jest.Mock<IHouseholdEntity>;
}

export interface IGetters extends IBaseGetters<IHouseholdEntity, IHouseholdMetadata> {}

export interface IGettersMock extends IBaseGettersMock<IHouseholdEntity, IHouseholdMetadata> {}

export interface IMutations extends IBaseMutations<IHouseholdEntity, IHouseholdMetadata> {}

export interface IMutationsMock extends IBaseMutationsMock<IHouseholdEntity, IHouseholdMetadata> {}

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
  make(): IStorageMake;
}

export interface IHouseholdStorageMock {
  make(): IStorageMakeMock;
}
