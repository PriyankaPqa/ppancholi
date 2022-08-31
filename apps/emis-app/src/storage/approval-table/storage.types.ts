import { IApprovalTableEntity, IApprovalTableEntityData, IApprovalTableMetadata } from '@libs/entities-lib/approvals/approvals-table/approvalTable.types';
import {
  IBaseActions,
  IBaseActionsMock,
  IBaseGetters,
  IBaseGettersMock,
  IBaseMutations,
  IBaseMutationsMock,
} from '../base';

export interface IActions extends IBaseActions<IApprovalTableEntity, IApprovalTableMetadata, uuid> {
  createApprovalTable (payload: IApprovalTableEntity): Promise<IApprovalTableEntityData>
}

export interface IActionsMock extends IBaseActionsMock<IApprovalTableEntity, IApprovalTableMetadata> {
  createApprovalTable: jest.Mock<IApprovalTableEntityData>;
}

export type IGetters = IBaseGetters<IApprovalTableEntity, IApprovalTableMetadata>

export type IGettersMock = IBaseGettersMock<IApprovalTableEntity, IApprovalTableMetadata>

export type IMutations = IBaseMutations<IApprovalTableEntity, IApprovalTableMetadata>

export type IMutationsMock = IBaseMutationsMock<IApprovalTableEntity, IApprovalTableMetadata>

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
