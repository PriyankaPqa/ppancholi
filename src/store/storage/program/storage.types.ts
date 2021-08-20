import { IProgramEntity, IProgramMetadata } from '@/entities/program';
import {
  IBaseActions, IBaseActionsMock, IBaseGetters, IBaseGettersMock, IBaseMutations, IBaseMutationsMock,
} from '../base';

export interface IGetters extends IBaseGetters<IProgramEntity, IProgramMetadata> {}

export interface IGettersMock extends IBaseGettersMock<IProgramEntity, IProgramMetadata> {
}

export interface IActions extends IBaseActions<IProgramEntity, IProgramMetadata, { id: uuid; eventId: uuid }> {
  createProgram(payload: IProgramEntity): Promise<IProgramEntity>;
  updateProgram(payload: IProgramEntity): Promise<IProgramEntity>;
}

export interface IActionsMock extends IBaseActionsMock<IProgramEntity, IProgramMetadata> {
  createProgram: jest.Mock<IProgramEntity>;
  updateProgram: jest.Mock<IProgramEntity>;
}

export interface IMutations extends IBaseMutations<IProgramEntity, IProgramMetadata> {}

export interface IMutationsMock extends IBaseMutationsMock<IProgramEntity, IProgramMetadata> {}

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
