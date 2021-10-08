import {
  IFinancialAssistancePaymentEntity, IFinancialAssistancePaymentGroup, IFinancialAssistancePaymentMetadata, PaymentStatus,
} from '@/entities/financial-assistance-payment';
import {
  IBaseActions, IBaseActionsMock, IBaseGetters, IBaseGettersMock, IBaseMutations, IBaseMutationsMock,
} from '../base';

export interface IGetters extends IBaseGetters<IFinancialAssistancePaymentEntity, IFinancialAssistancePaymentMetadata> {
}

export interface IGettersMock extends IBaseGettersMock<IFinancialAssistancePaymentEntity, IFinancialAssistancePaymentMetadata> {
}

export interface IActions extends IBaseActions<IFinancialAssistancePaymentEntity, IFinancialAssistancePaymentMetadata, uuid> {
  addFinancialAssistancePayment(entity: IFinancialAssistancePaymentEntity): Promise<IFinancialAssistancePaymentEntity>;
  editFinancialAssistancePayment(entity: IFinancialAssistancePaymentEntity): Promise<IFinancialAssistancePaymentEntity>;
  updatePaymentStatus(entityId: uuid, paymentGroupId: uuid, status: PaymentStatus): Promise<IFinancialAssistancePaymentEntity>;
  submitFinancialAssistancePayment(entityId: uuid): Promise<IFinancialAssistancePaymentEntity>;
  addFinancialAssistancePaymentLine(financialAssistanceId: uuid, entity: IFinancialAssistancePaymentGroup):
    Promise<IFinancialAssistancePaymentEntity>;
  editFinancialAssistancePaymentLine(financialAssistanceId: uuid, entity: IFinancialAssistancePaymentGroup):
    Promise<IFinancialAssistancePaymentEntity>;
  deleteFinancialAssistancePaymentLine(financialAssistanceId: uuid, paymentId: uuid):
    Promise<IFinancialAssistancePaymentEntity>;
}

export interface IActionsMock extends IBaseActionsMock<IFinancialAssistancePaymentEntity, IFinancialAssistancePaymentMetadata> {
  addFinancialAssistancePayment: jest.Mock<IFinancialAssistancePaymentEntity>;
  editFinancialAssistancePayment: jest.Mock<IFinancialAssistancePaymentEntity>;
  updatePaymentStatus: jest.Mock<IFinancialAssistancePaymentEntity>;
  submitFinancialAssistancePayment: jest.Mock<IFinancialAssistancePaymentEntity>;
  addFinancialAssistancePaymentLine: jest.Mock<IFinancialAssistancePaymentEntity>;
  editFinancialAssistancePaymentLine: jest.Mock<IFinancialAssistancePaymentEntity>;
  deleteFinancialAssistancePaymentLine: jest.Mock<IFinancialAssistancePaymentEntity>;
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
