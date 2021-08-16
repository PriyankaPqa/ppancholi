import { IOptionItem, IOptionItemMetadata } from '@/entities/optionItem';
import {
  IBaseActions,
  IBaseActionsMock,
  IBaseGetters,
  IBaseGettersMock,
  IBaseMutations,
  IBaseMutationsMock,
} from '../base';

export interface IActions extends IBaseActions<IOptionItem, IOptionItemMetadata, uuid> {
}

export interface IActionsMock extends IBaseActionsMock<IOptionItem, IOptionItemMetadata> {

}

export interface IGetters extends IBaseGetters<IOptionItem, IOptionItemMetadata> {

}

export interface IGettersMock extends IBaseGettersMock<IOptionItem, IOptionItemMetadata> {

}

export interface IMutations extends IBaseMutations<IOptionItem, IOptionItemMetadata> {
}

export interface IMutationsMock extends IBaseMutationsMock<IOptionItem, IOptionItemMetadata> {
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
