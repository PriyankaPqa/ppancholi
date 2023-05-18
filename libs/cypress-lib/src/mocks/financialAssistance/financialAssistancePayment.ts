import {
  ApprovalStatus,
  IFinancialAssistancePaymentEntity,
  IFinancialAssistancePaymentGroup,
  IFinancialAssistancePaymentLine,
  IGroupingInformation,
  PayeeType,
  PaymentStatus } from '@libs/entities-lib/financial-assistance-payment';
import { mockBaseData } from '@libs/entities-lib/src/base';
import { EPaymentModalities } from '@libs/entities-lib/src/program';

export const mockFinancialAssistancePaymentLine = (force?: Partial<IFinancialAssistancePaymentLine>) : IFinancialAssistancePaymentLine => ({
  ...mockBaseData(),
  id: '',
  mainCategoryId: 'ade08607-c1c8-4efe-8608-a5ad6e8d676f',
  subCategoryId: '39443fea-7010-4e63-9d13-280db61a9715',
  documentReceived: false,
  amount: 80.00,
  actualAmount: null,
  relatedNumber: '2211',
  careOf: null,
  address: null,
...force,
});

export const mockGroupingInformation = (force?: Partial<IGroupingInformation>) : IGroupingInformation => ({
  modality: EPaymentModalities.PrepaidCard,
  payeeType: PayeeType.Individual,
  payeeName: 'Krisitina',
  ...force,
});

export const mockFinancialAssistancePaymentGroup = (force?: Partial<IFinancialAssistancePaymentGroup>) : IFinancialAssistancePaymentGroup => ({
  ...mockBaseData(),
  groupingInformation: mockGroupingInformation(),
  paymentStatus: PaymentStatus.New,
  lines: [mockFinancialAssistancePaymentLine()],
  cancellationReason: null,
  cancellationDate: null,
  cancellationBy: null,
  ...force,
});

export const mockFinancialAssistancePaymentRequest = (force?: Partial<IFinancialAssistancePaymentEntity>) : IFinancialAssistancePaymentEntity => ({
  ...mockBaseData(),
  caseFileId: '6cc65951-480f-4c1b-94b4-921dcb0c3d9c',
  financialAssistanceTableId: 'afaf0c99-e305-4702-9783-0adb0576f57f',
  name: 'FA Payment',
  description: 'Description',
  approvalStatus: ApprovalStatus.New,
  approvalAction: null,
  groups: [mockFinancialAssistancePaymentGroup()],
  ...force,
});
