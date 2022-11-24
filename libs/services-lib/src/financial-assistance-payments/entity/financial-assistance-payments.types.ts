import { IVersionedEntity } from '@libs/entities-lib/value-objects/versioned-entity';
import {
  IFinancialAssistancePaymentEntity, IFinancialAssistancePaymentGroup, PaymentsSummary, PaymentStatus,
} from '@libs/entities-lib/financial-assistance-payment';
import { IApprovalActionPayload } from '@libs/entities-lib/src/financial-assistance-payment/financial-assistance-payment.types';
import { IDomainBaseService, IDomainBaseServiceMock } from '../../base';

export interface IFinancialAssistancePaymentsService extends IDomainBaseService<IFinancialAssistancePaymentEntity, uuid> {
  addFinancialAssistancePayment(entity: IFinancialAssistancePaymentEntity): Promise<IFinancialAssistancePaymentEntity>;
  editFinancialAssistancePayment(entity: IFinancialAssistancePaymentEntity): Promise<IFinancialAssistancePaymentEntity>;
  updatePaymentStatus(entityId: uuid, paymentGroupId: uuid, status: PaymentStatus): Promise<IFinancialAssistancePaymentEntity>
  submitFinancialAssistancePayment(entityId: uuid): Promise<IFinancialAssistancePaymentEntity>;
  submitApprovalRequest(paymentId: uuid, submitTo: uuid): Promise<IFinancialAssistancePaymentEntity>
  submitApprovalAction(paymentId: uuid, payload: IApprovalActionPayload): Promise<IFinancialAssistancePaymentEntity>
  addFinancialAssistancePaymentLine(financialAssistanceId: uuid, entity: IFinancialAssistancePaymentGroup):
    Promise<IFinancialAssistancePaymentEntity>;
  editFinancialAssistancePaymentLine(financialAssistanceId: uuid, entity: IFinancialAssistancePaymentGroup):
    Promise<IFinancialAssistancePaymentEntity>;
  deleteFinancialAssistancePaymentLine(financialAssistanceId: uuid, paymentId: uuid):
    Promise<IFinancialAssistancePaymentEntity>;
  getHistory(financialAssistanceId: uuid): Promise<IVersionedEntity[]>;
  getMetadataHistory(financialAssistanceId: uuid): Promise<IVersionedEntity[]>;
  getPaymentSummary(caseFileId: uuid): Promise<PaymentsSummary>;
  getNextApprovalGroupRoles(financialAssistanceId: uuid): Promise<uuid[]>;
}

export interface IFinancialAssistancePaymentsServiceMock extends IDomainBaseServiceMock<IFinancialAssistancePaymentEntity> {
  addFinancialAssistancePayment: jest.Mock<IFinancialAssistancePaymentEntity>;
  editFinancialAssistancePayment: jest.Mock<IFinancialAssistancePaymentEntity>;
  updatePaymentStatus: jest.Mock<IFinancialAssistancePaymentEntity>;
  submitFinancialAssistancePayment: jest.Mock<IFinancialAssistancePaymentEntity>;
  submitApprovalRequest: jest.Mock<IFinancialAssistancePaymentEntity>;
  submitApprovalAction: jest.Mock<IFinancialAssistancePaymentEntity>;
  addFinancialAssistancePaymentLine: jest.Mock<IFinancialAssistancePaymentEntity>;
  editFinancialAssistancePaymentLine: jest.Mock<IFinancialAssistancePaymentEntity>;
  deleteFinancialAssistancePaymentLine: jest.Mock<IFinancialAssistancePaymentEntity>;
  getHistory: jest.Mock<IVersionedEntity[]>;
  getMetadataHistory: jest.Mock<IVersionedEntity[]>;
  getPaymentSummary: jest.Mock<PaymentsSummary>;
  getNextApprovalGroupRoles: jest.Mock<uuid[]>;
}
