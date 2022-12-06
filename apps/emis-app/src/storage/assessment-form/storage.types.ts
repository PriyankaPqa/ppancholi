import {
 IAssessmentFormMetadata, IAssessmentFormEntity, IAssessmentBaseEntity,
} from '@libs/entities-lib/assessment-template';
import {
  IBaseActions, IBaseActionsMock, IBaseGetters, IBaseGettersMock, IBaseMutations, IBaseMutationsMock,
} from '../base';

export interface IGetters extends IBaseGetters<IAssessmentFormEntity, IAssessmentFormMetadata> {
}

export interface IGettersMock extends IBaseGettersMock<IAssessmentFormEntity, IAssessmentFormMetadata> {
}

export interface IActions extends IBaseActions<IAssessmentFormEntity, IAssessmentFormMetadata, { id: uuid }> {
  create(payload: IAssessmentFormEntity): Promise<IAssessmentFormEntity>;
  update(payload: IAssessmentFormEntity): Promise<IAssessmentFormEntity>;
  updateAssessmentStructure(payload: IAssessmentBaseEntity): Promise<IAssessmentFormEntity>;
  fetchByProgramId(programId: uuid): Promise<IAssessmentFormEntity[]>;
}

export interface IActionsMock extends IBaseActionsMock<IAssessmentFormEntity, IAssessmentFormMetadata> {
  create: jest.Mock<IAssessmentFormEntity>;
  update: jest.Mock<IAssessmentFormEntity>;
  updateAssessmentStructure: jest.Mock<IAssessmentFormEntity>;
  fetchByProgramId: jest.Mock<IAssessmentFormEntity[]>;
}

export interface IMutations extends IBaseMutations<IAssessmentFormEntity, IAssessmentFormMetadata> {
 }

export interface IMutationsMock extends IBaseMutationsMock<IAssessmentFormEntity, IAssessmentFormMetadata> {
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
