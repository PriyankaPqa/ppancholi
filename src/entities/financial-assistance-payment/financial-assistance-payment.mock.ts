/* eslint-disable */
import {
  PaymentStatus,
  IFinancialAssistancePaymentEntity,
  IFinancialAssistancePaymentGroup,
  ApprovalStatus,
  IFinancialAssistancePaymentCombined,
} from './financial-assistance-payment.types';
import { mockItems } from '@/entities/financial-assistance';
import { mockBaseData } from '../base';

export const mockCaseFinancialAssistancePaymentGroups = ():
  IFinancialAssistancePaymentGroup[] => [
  {
    ...mockBaseData(),
    paymentStatus: PaymentStatus.New,
    groupingInformation: {
      modality: 2,
      payeeType: 1,
      payeeName: 'thl',
    },
    lines: [
      {
        mainCategoryId: mockItems()[0].mainCategory.id,
        subCategoryId: mockItems()[0].subItems[0].subCategory.id,
        documentReceived: true,
        amount: 88,
        actualAmount: 0,
        relatedNumber: '',
        careOf: '',
        address: null,
      },
    ],
  },
];

export const mockCaseFinancialAssistanceEntity = (force?: Partial<IFinancialAssistancePaymentEntity>, index = 0): IFinancialAssistancePaymentEntity => ({
  ...mockBaseData(),
  id: mockBaseData().id + index,
  caseFileId: '21f78eff-7b48-46b6-a363-ed479011d572',
  financialAssistanceTableId: 'c05bd971-f0fe-4e3d-a20e-6a0c7c7bd52a',
  name: 'thl payment',
  description: 'thl payment desc',
  groups: mockCaseFinancialAssistancePaymentGroups(),
  approvalStatus: ApprovalStatus.New,
  ...force,
});

export const mockCaseFinancialAssistanceEntities = (): IFinancialAssistancePaymentEntity[] => ([
  mockCaseFinancialAssistanceEntity({ id: '1' }),
  mockCaseFinancialAssistanceEntity({ id: '2', approvalStatus: ApprovalStatus.Approved }, 1),
]);

export const mockCombinedCaseFinancialAssistance = (force?: Partial<IFinancialAssistancePaymentEntity>): IFinancialAssistancePaymentCombined => ({
  entity: mockCaseFinancialAssistanceEntity(force),
  metadata: null,
});
