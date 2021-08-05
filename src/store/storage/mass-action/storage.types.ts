import { IMassActionEntity, IMassActionMetadata } from '@/entities/mass-action';
import {
  IBaseActions,
  IBaseActionsMock,
  IBaseGetters,
  IBaseGettersMock,
  IBaseMutations,
  IBaseMutationsMock,
} from '../base';

export interface IActions extends IBaseActions<IMassActionEntity, IMassActionMetadata, uuid> {
}

export interface IActionsMock extends IBaseActionsMock<IMassActionEntity, IMassActionMetadata> {

}

export interface IGetters extends IBaseGetters<IMassActionEntity, IMassActionMetadata> {

}

export interface IGettersMock extends IBaseGettersMock<IMassActionEntity, IMassActionMetadata> {

}

export interface IMutations extends IBaseMutations<IMassActionEntity, IMassActionMetadata> {
}

export interface IMutationsMock extends IBaseMutationsMock<IMassActionEntity, IMassActionMetadata> {
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
  make(): IStorageMake
}
