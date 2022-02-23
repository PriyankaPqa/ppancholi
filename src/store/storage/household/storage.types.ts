import { IAddress } from '../../../entities/value-objects/address';
import { IHouseholdEntity, IHouseholdMetadata } from '../../../entities/household';
import {
  IBaseActions,
  IBaseGetters,
  IBaseMutations,
  IBaseActionsMock,
  IBaseGettersMock,
  IBaseMutationsMock,
} from '../base/base.types';
import { IVersionedEntity } from '../../../entities/value-objects/versioned-entity';

export interface IActions extends IBaseActions<IHouseholdEntity, IHouseholdMetadata, uuid> {
  updateNoFixedHomeAddress (householdId: string, observation: string): Promise<IHouseholdEntity>;
  updateHomeAddress (householdId: string, address: IAddress): Promise<IHouseholdEntity>;
  fetchHouseholdHistory (household: IHouseholdEntity): Promise<IVersionedEntity[]>;
}

export interface IActionsMock extends IBaseActionsMock<IHouseholdEntity, IHouseholdMetadata> {
  updateNoFixedHomeAddress: jest.Mock<IHouseholdEntity>;
  updateHomeAddress: jest.Mock<IHouseholdEntity>;
  fetchHouseholdHistory: jest.Mock<IVersionedEntity[]>;
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
