import { IOptionItem } from '@/entities/optionItem';
import {
  IBaseActions,
  IBaseActionsMock,
  IBaseGetters,
  IBaseGettersMock,
  IBaseMutations,
  IBaseMutationsMock,
} from '../base';

export interface IActions extends IBaseActions<IOptionItem, never, uuid> {
}

export interface IActionsMock extends IBaseActionsMock<IOptionItem, never> {

}

export interface IGetters extends IBaseGetters<IOptionItem, never> {

}

export interface IGettersMock extends IBaseGettersMock<IOptionItem, never> {

}

export interface IMutations extends IBaseMutations<IOptionItem, never> {
}

export interface IMutationsMock extends IBaseMutationsMock<IOptionItem, never> {
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
