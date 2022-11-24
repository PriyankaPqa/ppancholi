import { IApprovalTableEntity, IApprovalTableEntityData, IApprovalTableMetadata } from '@libs/entities-lib/approvals/approvals-table/approvalTable.types';
import { IApprovalGroup } from '@libs/entities-lib/approvals/approvals-group';
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
  editApprovalTable (payload: IApprovalTableEntity): Promise<IApprovalTableEntityData>
  addGroup(approvalId: uuid, group: IApprovalGroup): Promise<IApprovalTableEntityData>
  editGroup(approvalId: uuid, group: IApprovalGroup): Promise<IApprovalTableEntityData>
  removeGroup (approvalId: uuid, groupId: uuid): Promise<IApprovalTableEntityData>
}

export interface IActionsMock extends IBaseActionsMock<IApprovalTableEntity, IApprovalTableMetadata> {
  createApprovalTable: jest.Mock<IApprovalTableEntityData>;
  editApprovalTable: jest.Mock<IApprovalTableEntityData>;
  addGroup: jest.Mock<IApprovalTableEntityData>;
  editGroup: jest.Mock<IApprovalTableEntityData>;
  removeGroup: jest.Mock<IApprovalTableEntityData>;
}

export type IGetters = IBaseGetters<IApprovalTableEntity, IApprovalTableMetadata>;

export type IGettersMock = IBaseGettersMock<IApprovalTableEntity, IApprovalTableMetadata>;

export type IMutations = IBaseMutations<IApprovalTableEntity, IApprovalTableMetadata>;

export type IMutationsMock = IBaseMutationsMock<IApprovalTableEntity, IApprovalTableMetadata>;

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
