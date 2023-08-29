import { itemFinancialAssistance, subItemFinancialAssistance } from '@libs/cypress-lib/helpers';
import {
  ApprovalAction,
  ApprovalStatus,
  IApprovalActionPayload,
  IFinancialAssistancePaymentEntity,
  IFinancialAssistancePaymentGroup,
  IFinancialAssistancePaymentLine,
  IGroupingInformation,
  PayeeType,
  PaymentStatus } from '@libs/entities-lib/financial-assistance-payment';
import { mockBaseData } from '@libs/entities-lib/src/base';
import { EPaymentModalities } from '@libs/entities-lib/src/program';
import { IAddress } from '@libs/entities-lib/src/value-objects/address/address.types';
import { IUpdatePaymentStatusParams } from '@libs/services-lib/src/financial-assistance-payments/entity';
import { mockBaseAddressData } from '../household/household';

export const mockFinancialAssistancePaymentLine = (force?: Partial<IFinancialAssistancePaymentLine>) : IFinancialAssistancePaymentLine => ({
  ...mockBaseData(),
  id: '',
  mainCategoryId: itemFinancialAssistance.clothing,
  subCategoryId: subItemFinancialAssistance.winterClothing,
  documentReceived: false,
  amount: 80.00,
  actualAmount: null,
  relatedNumber: '2211',
  careOf: null,
  address: mockBaseAddressData() as unknown as IAddress,
  ...force,
});

export const mockGroupingInformation = (modality: EPaymentModalities, force?: Partial<IGroupingInformation>) : IGroupingInformation => ({
  modality,
  payeeType: PayeeType.Individual,
  payeeName: 'Krisitina',
  ...force,
});

export const mockFinancialAssistancePaymentGroup = (modality: EPaymentModalities, force?: Partial<IFinancialAssistancePaymentGroup>) : IFinancialAssistancePaymentGroup => ({
  ...mockBaseData(),
  groupingInformation: mockGroupingInformation(modality),
  paymentStatus: PaymentStatus.New,
  lines: [mockFinancialAssistancePaymentLine()],
  cancellationReason: null,
  cancellationDate: null,
  cancellationBy: null,
  ...force,
});

export const mockFinancialAssistancePaymentRequest = (modality: EPaymentModalities, force?: Partial<IFinancialAssistancePaymentEntity>) : IFinancialAssistancePaymentEntity => ({
  ...mockBaseData(),
  caseFileId: '6cc65951-480f-4c1b-94b4-921dcb0c3d9c',
  financialAssistanceTableId: 'afaf0c99-e305-4702-9783-0adb0576f57f',
  name: 'FA Payment',
  description: 'Description',
  approvalStatus: ApprovalStatus.New,
  approvalAction: null,
  groups: [mockFinancialAssistancePaymentGroup(modality)],
  ...force,
});

export const mockUpdatePaymentRequest = (status: PaymentStatus, force?: Partial<IUpdatePaymentStatusParams>) : IUpdatePaymentStatusParams => ({
  entityId: '',
  paymentGroupId: '',
  status,
  ...force,
});

export const mockApprovalActionRequest = (submittedTo: string) : IApprovalActionPayload => ({
  approvalAction: ApprovalAction.Approved,
  submittedTo,
  rationale: 'sending this for next level approval',
});
