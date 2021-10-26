import { IFeatureEntity } from '@/entities/feature';
import {
  IBaseActions, IBaseActionsMock, IBaseGetters, IBaseGettersMock, IBaseMutations, IBaseMutationsMock,
} from '../base';

export interface IGetters extends IBaseGetters<IFeatureEntity, never> {
  feature(name: string): IFeatureEntity;
}

export interface IGettersMock extends IBaseGettersMock<IFeatureEntity, never> {
  feature: jest.Mock<IFeatureEntity>;
}

export interface IActions extends IBaseActions<IFeatureEntity, never, uuid> {}

export interface IActionsMock extends IBaseActionsMock<IFeatureEntity, never> {}

export interface IMutations extends IBaseMutations<IFeatureEntity, never> {}

export interface IMutationsMock extends IBaseMutationsMock<IFeatureEntity, never> {}

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

export interface IStorageMock {
  make(): IStorageMake;
}
