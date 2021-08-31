import { IFinancialAssistancePaymentEntity } from '@/entities/financial-assistance-payment';

export interface IFinancialAssistancePaymentsService {
  addFinancialAssistancePayment(entity: IFinancialAssistancePaymentEntity): Promise<IFinancialAssistancePaymentEntity>;
}

export interface IFinancialAssistancePaymentsServiceMock {
  addFinancialAssistancePayment: jest.Mock<IFinancialAssistancePaymentEntity>;
}
