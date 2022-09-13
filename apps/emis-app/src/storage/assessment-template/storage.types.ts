import { IAssessmentBaseEntity, IAssessmentTemplateEntity, IAssessmentTemplateMetadata } from '@libs/entities-lib/assessment-template';
import {
  IBaseActions, IBaseActionsMock, IBaseGetters, IBaseGettersMock, IBaseMutations, IBaseMutationsMock,
} from '../base';

export interface IGetters extends IBaseGetters<IAssessmentTemplateEntity, IAssessmentTemplateMetadata> {
}

export interface IGettersMock extends IBaseGettersMock<IAssessmentTemplateEntity, IAssessmentTemplateMetadata> {
}

export interface IActions extends IBaseActions<IAssessmentTemplateEntity, IAssessmentTemplateMetadata, {id: uuid}> {
  create(payload: IAssessmentTemplateEntity): Promise<IAssessmentTemplateEntity>;
  update(payload: IAssessmentTemplateEntity): Promise<IAssessmentTemplateEntity>;
  updateAssessmentStructure(payload: IAssessmentBaseEntity): Promise<IAssessmentTemplateEntity>;
}

export interface IActionsMock extends IBaseActionsMock<IAssessmentTemplateEntity, IAssessmentTemplateMetadata> {
  create: jest.Mock<IAssessmentTemplateEntity>;
  update: jest.Mock<IAssessmentTemplateEntity>;
  updateAssessmentStructure: jest.Mock<IAssessmentTemplateEntity>;
}

export interface IMutations extends IBaseMutations<IAssessmentTemplateEntity, IAssessmentTemplateMetadata> {
 }

export interface IMutationsMock extends IBaseMutationsMock<IAssessmentTemplateEntity, IAssessmentTemplateMetadata> {
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
