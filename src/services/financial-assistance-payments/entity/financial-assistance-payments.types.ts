import { IVersionedEntity } from '@crctech/registration-lib/src/entities/value-objects/versioned-entity';
import { IFinancialAssistancePaymentEntity, IFinancialAssistancePaymentGroup, PaymentStatus } from '@/entities/financial-assistance-payment';
import { IDomainBaseService, IDomainBaseServiceMock } from '@/services/base';

export interface IFinancialAssistancePaymentsService extends IDomainBaseService<IFinancialAssistancePaymentEntity, uuid>{
  addFinancialAssistancePayment(entity: IFinancialAssistancePaymentEntity): Promise<IFinancialAssistancePaymentEntity>;
  editFinancialAssistancePayment(entity: IFinancialAssistancePaymentEntity): Promise<IFinancialAssistancePaymentEntity>;
  updatePaymentStatus(entityId: uuid, paymentGroupId: uuid, status: PaymentStatus): Promise<IFinancialAssistancePaymentEntity>
  submitFinancialAssistancePayment(entityId: uuid): Promise<IFinancialAssistancePaymentEntity>;
  addFinancialAssistancePaymentLine(financialAssistanceId: uuid, entity: IFinancialAssistancePaymentGroup):
    Promise<IFinancialAssistancePaymentEntity>;
  editFinancialAssistancePaymentLine(financialAssistanceId: uuid, entity: IFinancialAssistancePaymentGroup):
    Promise<IFinancialAssistancePaymentEntity>;
  deleteFinancialAssistancePaymentLine(financialAssistanceId: uuid, paymentId: uuid):
    Promise<IFinancialAssistancePaymentEntity>;
  getHistory(financialAssistanceId: uuid): Promise<IVersionedEntity[]>;
  getMetadataHistory(financialAssistanceId: uuid): Promise<IVersionedEntity[]>;
}

export interface IFinancialAssistancePaymentsServiceMock extends IDomainBaseServiceMock<IFinancialAssistancePaymentEntity>{
  addFinancialAssistancePayment: jest.Mock<IFinancialAssistancePaymentEntity>;
  editFinancialAssistancePayment: jest.Mock<IFinancialAssistancePaymentEntity>;
  updatePaymentStatus: jest.Mock<IFinancialAssistancePaymentEntity>;
  submitFinancialAssistancePayment: jest.Mock<IFinancialAssistancePaymentEntity>;
  addFinancialAssistancePaymentLine: jest.Mock<IFinancialAssistancePaymentEntity>;
  editFinancialAssistancePaymentLine: jest.Mock<IFinancialAssistancePaymentEntity>;
  deleteFinancialAssistancePaymentLine: jest.Mock<IFinancialAssistancePaymentEntity>;
  getHistory: jest.Mock<IVersionedEntity[]>;
  getMetadataHistory: jest.Mock<IVersionedEntity[]>;
}
