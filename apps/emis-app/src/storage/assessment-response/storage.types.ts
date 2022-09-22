import { IAssessmentResponseMetadata, IAssessmentResponseEntity, IAssessmentResponseCreateRequest } from '@libs/entities-lib/assessment-template';
import {
  IBaseActions, IBaseActionsMock, IBaseGetters, IBaseGettersMock, IBaseMutations, IBaseMutationsMock,
} from '../base';

export interface IGetters extends IBaseGetters<IAssessmentResponseEntity, IAssessmentResponseMetadata> {
}

export interface IGettersMock extends IBaseGettersMock<IAssessmentResponseEntity, IAssessmentResponseMetadata> {
}

export interface IActions extends IBaseActions<IAssessmentResponseEntity, IAssessmentResponseMetadata, {id: uuid}> {
  create(payload: IAssessmentResponseCreateRequest): Promise<IAssessmentResponseEntity>;
  update(payload: IAssessmentResponseEntity): Promise<IAssessmentResponseEntity>;
  saveAssessmentAnsweredQuestions(payload: IAssessmentResponseEntity): Promise<IAssessmentResponseEntity>;
}

export interface IActionsMock extends IBaseActionsMock<IAssessmentResponseEntity, IAssessmentResponseMetadata> {
  create: jest.Mock<IAssessmentResponseEntity>;
  update: jest.Mock<IAssessmentResponseEntity>;
  saveAssessmentAnsweredQuestions: jest.Mock<IAssessmentResponseEntity>;
}

export interface IMutations extends IBaseMutations<IAssessmentResponseEntity, IAssessmentResponseMetadata> {
 }

export interface IMutationsMock extends IBaseMutationsMock<IAssessmentResponseEntity, IAssessmentResponseMetadata> {
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
