/* eslint-disable */
import {
  PaymentStatus,
  IFinancialAssistancePaymentEntity,
  IFinancialAssistancePaymentGroup,
  ApprovalStatus,
  PaymentsSummary,
  IFinancialAssistancePaymentCombined,
  IFinancialAssistancePaymentMetadata,
} from './financial-assistance-payment.types';
import { mockItems } from '@/entities/financial-assistance';
import { mockBaseData } from '../base';
import { IVersionedEntity } from '@libs/registration-lib/entities/value-objects/versioned-entity';
import { EPaymentModalities } from '../program';

export const mockCaseFinancialAssistancePaymentGroups = ():
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
      },
    ],
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
  ...force,
});

export const mockCaseFinancialAssistanceMetadata = (force? : Partial<IFinancialAssistancePaymentMetadata>) : IFinancialAssistancePaymentMetadata => ({
  ...mockBaseData(),
  total: 123,
  approvalStatusName: {
    translation: {
      en: 'approvalStatusNameEn',
      fr: 'approvalStatusNameFr',
    },
  },
  ...force,
});

export const mockPaymentSummary = () : PaymentsSummary => {
  return ({
    totalAmountCommitted: 121.56,
    totalAmountCompleted: 233.43,
    totalAmountUnapproved: 333.43,
    grandTotalAmount: 876.43,
    paymentModalityCounts: [
      { modality: EPaymentModalities.Cheque, count: 1 },
      { modality: EPaymentModalities.DirectDeposit, count: 2 },
      { modality: EPaymentModalities.ETransfer, count: 1 },
    ]
  });
}

export const mockFinancialPaymentHistory = () : IVersionedEntity[] => {
  return [{
    versionId: '2021-10-15T14:27:07.9574544Z',
    timestamp: '2021-10-15T14:27:07Z',
    userName: 'Thi Hung Lieu',
    roleName: {
      translation: {
        en: 'System Admin',
        fr: 'Administrateur(-trice) de système',
      },
    },
    entity: {
      caseFileId: '6b0c8642-257b-473a-bc82-3da2829ffebc',
      financialAssistanceTableId: 'df2c660c-e0ed-412c-8019-b1dc7e66e649',
      name: 'thl payment submit history',
      description: 'thl payment submit history',
      approvalStatus: 3,
      approvalAction: 1,
      rationale: 'ApprovalActionRationale.PaymentSubmitted',
      groups: [{
        groupingInformation: {
          modality: 2,
          payeeType: 1,
          payeeName: 'thl',
        },
        paymentStatus: 1,
        cancellationReason: null,
        cancellationDate: null,
        cancellationBy: null,
        lines: [{
          mainCategoryId: 'a06788fb-88eb-4ad6-a950-573528fea215',
          subCategoryId: '00f6da49-0b14-4fd2-bad6-6a46e74242ce',
          documentReceived: true,
          amount: 50,
          actualAmount: null,
          relatedNumber: '',
          careOf: 'thl',
          address: {
            country: 'CA',
            streetAddress: '120 Peel Street',
            unitSuite: '111',
            province: 11,
            specifiedOtherProvince: null,
            city: 'Montreal',
            postalCode: 'M4B 1G5',
            latitude: 90,
            longitude: 180,
          },
          id: '5ffb6429-1275-4ee6-8cc9-bd4e77b9ba4d',
          tenantId: 'c400f50d-7a56-4ef2-8e44-211bfa434724',
          created: '2021-10-15T14:25:05.5152326Z',
          timestamp: '2021-10-15T14:25:05.5152326Z',
          status: 1,
          createdBy: '9875ba14-8790-4db3-983a-139057c69ea6',
          lastUpdatedBy: null,
          lastAction: 'Created',
          lastActionCorrelationId: 'cbb403a9-96a0-48bb-9af6-bbb409fc5531',
          _eTag: '*',
        },
        ],
        id: 'dfdfac84-3063-47b0-b113-1a9c1870b04f',
        tenantId: 'c400f50d-7a56-4ef2-8e44-211bfa434724',
        created: '2021-10-15T14:25:05.5140061Z',
        timestamp: '2021-10-15T14:25:05.5140061Z',
        status: 1,
        createdBy: '9875ba14-8790-4db3-983a-139057c69ea6',
        lastUpdatedBy: null,
        lastAction: 'Created',
        lastActionCorrelationId: '410a6e1c-a88e-4b21-9b5b-aa047552cfff',
        _eTag: '*',
      },
      ],
      id: 'd50abfc7-8eb9-425a-9d90-3508b79f681f',
      tenantId: 'c400f50d-7a56-4ef2-8e44-211bfa434724',
      created: '2021-10-15T14:25:05.5102161Z',
      timestamp: '2021-10-15T14:27:07.2746879Z',
      status: 1,
      createdBy: '9875ba14-8790-4db3-983a-139057c69ea6',
      lastUpdatedBy: '9875ba14-8790-4db3-983a-139057c69ea6',
      lastAction: 'Submit',
      lastActionCorrelationId: '1c5cd404-ce5f-4546-aae5-7d49d7c00313',
      _eTag: '"b700e6f8-0000-0a00-0000-61698f450000"',
    },
  },
  {
    versionId: '2021-10-15T14:25:22.7786145Z',
    timestamp: '2021-10-15T14:25:22Z',
    userName: 'Thi Hung Lieu',
    roleName: {
      translation: {
        en: 'System Admin',
        fr: 'Administrateur(-trice) de système',
      },
    },
    entity: {
      caseFileId: '6b0c8642-257b-473a-bc82-3da2829ffebc',
      financialAssistanceTableId: 'df2c660c-e0ed-412c-8019-b1dc7e66e649',
      name: 'thl payment submit history',
      description: 'thl payment submit history',
      approvalStatus: 1,
      approvalAction: null,
      rationale: null,
      groups: [{
        groupingInformation: {
          modality: 2,
          payeeType: 1,
          payeeName: 'thl',
        },
        paymentStatus: 1,
        cancellationReason: null,
        cancellationDate: null,
        cancellationBy: null,
        lines: [{
          mainCategoryId: 'a06788fb-88eb-4ad6-a950-573528fea215',
          subCategoryId: '00f6da49-0b14-4fd2-bad6-6a46e74242ce',
          documentReceived: true,
          amount: 50,
          actualAmount: null,
          relatedNumber: '',
          careOf: 'thl',
          address: {
            country: 'CA',
            streetAddress: '120 Peel Street',
            unitSuite: '111',
            province: 11,
            specifiedOtherProvince: null,
            city: 'Montreal',
            postalCode: 'M4B 1G5',
            latitude: 90,
            longitude: 180,
          },
          id: '5ffb6429-1275-4ee6-8cc9-bd4e77b9ba4d',
          tenantId: 'c400f50d-7a56-4ef2-8e44-211bfa434724',
          created: '2021-10-15T14:25:05.5152326Z',
          timestamp: '2021-10-15T14:25:05.5152326Z',
          status: 1,
          createdBy: '9875ba14-8790-4db3-983a-139057c69ea6',
          lastUpdatedBy: null,
          lastAction: 'Created',
          lastActionCorrelationId: 'cbb403a9-96a0-48bb-9af6-bbb409fc5531',
          _eTag: '*',
        },
        ],
        id: 'dfdfac84-3063-47b0-b113-1a9c1870b04f',
        tenantId: 'c400f50d-7a56-4ef2-8e44-211bfa434724',
        created: '2021-10-15T14:25:05.5140061Z',
        timestamp: '2021-10-15T14:25:05.5140061Z',
        status: 1,
        createdBy: '9875ba14-8790-4db3-983a-139057c69ea6',
        lastUpdatedBy: null,
        lastAction: 'Created',
        lastActionCorrelationId: '410a6e1c-a88e-4b21-9b5b-aa047552cfff',
        _eTag: '*',
      },
      ],
      id: 'd50abfc7-8eb9-425a-9d90-3508b79f681f',
      tenantId: 'c400f50d-7a56-4ef2-8e44-211bfa434724',
      created: '2021-10-15T14:25:05.5102161Z',
      timestamp: '2021-10-15T14:25:05.5102161Z',
      status: 1,
      createdBy: '9875ba14-8790-4db3-983a-139057c69ea6',
      lastUpdatedBy: null,
      lastAction: 'Created',
      lastActionCorrelationId: 'ab9093c6-96e1-48fe-9ea8-c9da32162e74',
      _eTag: '*',
    },
  }] as any[];
};

export const mockCaseFinancialAssistanceEntities = (): IFinancialAssistancePaymentEntity[] => ([
  mockCaseFinancialAssistanceEntity({ id: '1' }),
  mockCaseFinancialAssistanceEntity({ id: '2', approvalStatus: ApprovalStatus.Approved }, 1),
]);

export const mockCombinedCaseFinancialAssistance = (force?: Partial<IFinancialAssistancePaymentEntity>): IFinancialAssistancePaymentCombined => ({
  entity: mockCaseFinancialAssistanceEntity(force),
  metadata: mockCaseFinancialAssistanceMetadata(force),
});
