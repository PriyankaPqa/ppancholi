import { mockItems } from '../financial-assistance';
import { mockBaseData } from '../base';
import {
  PaymentStatus, IFinancialAssistancePaymentEntity, IFinancialAssistancePaymentGroup, ApprovalStatus, PaymentsSummary, ApprovalAction,
} from './financial-assistance-payment.types';
import { EPaymentModalities } from '../program';

export const mockCaseFinancialAssistancePaymentGroups = (force?: Partial<IFinancialAssistancePaymentGroup>):
  IFinancialAssistancePaymentGroup[] => [
  {
    ...mockBaseData(),
    paymentStatus: PaymentStatus.New,
    cancellationReason: null,
    cancellationDate: null,
    cancellationBy: null,
    groupingInformation: {
      modality: 2,
      payeeType: 1,
      payeeName: 'thl',
    },
    lines: [
      {
        ...mockBaseData(),
        id: 'line-id',
        mainCategoryId: mockItems()[0].mainCategory.id,
        subCategoryId: mockItems()[0].subItems[0].subCategory.id,
        documentReceived: true,
        amount: 88,
        actualAmount: null,
        relatedNumber: '',
        careOf: '',
        address: null,
        paymentStatus: null,
        cancellationReason: null,
        cancellationDate: null,
        cancellationBy: null,
      },
    ],
    paymentStatusHistory: [
      {
        actualDateOfAction: null,
        dateOfAction: '2023-01-18T15:51:28.0626034Z',
        paymentStatus: 1,
        userInformation: {
          userId: 'test-user-id-123456',
          userName: 'Mock user name',
          roleName: {
            translation: {
              en: 'System Admin',
              fr: 'System Admin in french',
            },
          },
        },
      },
    ],
    ...force,
  },
];

export const mockCaseFinancialAssistanceEntity = (force?: Partial<IFinancialAssistancePaymentEntity>, index = 0): IFinancialAssistancePaymentEntity => ({
  ...mockBaseData(),
  id: mockBaseData().id + (index || ''),
  caseFileId: '21f78eff-7b48-46b6-a363-ed479011d572',
  financialAssistanceTableId: 'c05bd971-f0fe-4e3d-a20e-6a0c7c7bd52a',
  name: 'thl payment',
  description: 'thl payment desc',
  groups: mockCaseFinancialAssistancePaymentGroups(),
  approvalStatus: ApprovalStatus.New,
  approvalAction: null,
  submittedTo: {
    userId: '6b0c8642-257b-473a-bc82-3da2829ffebb',
    userName: 'John Smith',
    roleName: { translation: { en: 'System Admin', fr: 'Administrateur(-trice) de système' } },
  },
  submittedBy: {
    userId: '6b0c8642-257b-473a-bc82-3da2829ffebd',
    userName: 'Jane Smith',
    roleName: { translation: { en: 'System Admin', fr: 'Administrateur(-trice) de système' } },
  },
  initialSubmitter: '6b0c8642-257b-473a-bc82-3da2829ffeba',
  approvalStatusHistory: [
    {
      submittedTo: {
        userId: '6b0c8642-257b-473a-bc82-3da2829ffebb',
        userName: 'John Smith',
        roleName: { translation: { en: 'System Admin', fr: 'Administrateur(-trice) de système' } },
      },
      submittedBy: {
        userId: '6b0c8642-257b-473a-bc82-3da2829ffebd',
        userName: 'Jane Smith',
        roleName: { translation: { en: 'System Admin', fr: 'Administrateur(-trice) de système' } },
      },
      approvalAction: ApprovalAction.Approved,
      dateOfApprovalAction: '2021-10-15T14:27:07Z',
      rationale: 'rationale',
    },
  ],
  ...force,
});

export const mockPaymentSummary = () : PaymentsSummary => ({
  totalAmountCommitted: 121.56,
  totalAmountCompleted: 233.43,
  totalAmountUnapproved: 333.43,
  grandTotalAmount: 876.43,
  paymentModalityCounts: [
    { modality: EPaymentModalities.Cheque, count: 1 },
    { modality: EPaymentModalities.DirectDeposit, count: 2 },
    { modality: EPaymentModalities.ETransfer, count: 1 },
  ],
});

export const mockCaseFinancialAssistanceEntities = (): IFinancialAssistancePaymentEntity[] => ([
  mockCaseFinancialAssistanceEntity({ id: '1' }),
  mockCaseFinancialAssistanceEntity({ id: '2', approvalStatus: ApprovalStatus.Approved }, 1),
]);
