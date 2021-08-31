import { IFinancialAssistancePaymentEntity, IFinancialAssistancePaymentMetadata } from '@/entities/financial-assistance-payment';
import {
  IBaseActions, IBaseActionsMock, IBaseGetters, IBaseGettersMock, IBaseMutations, IBaseMutationsMock,
} from '../base';

export interface IGetters extends IBaseGetters<IFinancialAssistancePaymentEntity, IFinancialAssistancePaymentMetadata> {
}

export interface IGettersMock extends IBaseGettersMock<IFinancialAssistancePaymentEntity, IFinancialAssistancePaymentMetadata> {
}

export interface IActions extends IBaseActions<IFinancialAssistancePaymentEntity, IFinancialAssistancePaymentMetadata, uuid> {
  addFinancialAssistancePayment(entity: IFinancialAssistancePaymentEntity): Promise<IFinancialAssistancePaymentEntity>;
}

export interface IActionsMock extends IBaseActionsMock<IFinancialAssistancePaymentEntity, IFinancialAssistancePaymentMetadata> {
  addFinancialAssistancePayment: jest.Mock<IFinancialAssistancePaymentEntity>;
}

export interface IMutations extends IBaseMutations<IFinancialAssistancePaymentEntity, IFinancialAssistancePaymentMetadata> {
}

export interface IMutationsMock extends IBaseMutationsMock<IFinancialAssistancePaymentEntity, IFinancialAssistancePaymentMetadata> {
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
