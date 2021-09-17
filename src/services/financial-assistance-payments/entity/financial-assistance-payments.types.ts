import { IFinancialAssistancePaymentEntity, IFinancialAssistancePaymentGroup } from '@/entities/financial-assistance-payment';

export interface IFinancialAssistancePaymentsService {
  addFinancialAssistancePayment(entity: IFinancialAssistancePaymentEntity): Promise<IFinancialAssistancePaymentEntity>;
  editFinancialAssistancePayment(entity: IFinancialAssistancePaymentEntity): Promise<IFinancialAssistancePaymentEntity>;
  submitFinancialAssistancePayment(entityId: uuid): Promise<IFinancialAssistancePaymentEntity>;
  addFinancialAssistancePaymentLine(financialAssistanceId: uuid, entity: IFinancialAssistancePaymentGroup):
    Promise<IFinancialAssistancePaymentEntity>;
  editFinancialAssistancePaymentLine(financialAssistanceId: uuid, entity: IFinancialAssistancePaymentGroup):
    Promise<IFinancialAssistancePaymentEntity>;
  deleteFinancialAssistancePaymentLine(financialAssistanceId: uuid, paymentId: uuid):
    Promise<IFinancialAssistancePaymentEntity>;
}

export interface IFinancialAssistancePaymentsServiceMock {
  addFinancialAssistancePayment: jest.Mock<IFinancialAssistancePaymentEntity>;
  editFinancialAssistancePayment: jest.Mock<IFinancialAssistancePaymentEntity>;
  submitFinancialAssistancePayment: jest.Mock<IFinancialAssistancePaymentEntity>;
  addFinancialAssistancePaymentLine: jest.Mock<IFinancialAssistancePaymentEntity>;
  editFinancialAssistancePaymentLine: jest.Mock<IFinancialAssistancePaymentEntity>;
  deleteFinancialAssistancePaymentLine: jest.Mock<IFinancialAssistancePaymentEntity>;
}
