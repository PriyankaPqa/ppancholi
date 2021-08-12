import
{
  FPaymentStatus,
  ICaseFinancialAssistanceEntity,
  ICaseFinancialAssistanceCombined,
  ICaseFinancialAssistancePaymentGroups,
} from './case-file-financial-assistance.types';
import { mockBaseData } from '../base';

export const mockCaseFinancialAssistancePaymentGroups = (): ICaseFinancialAssistancePaymentGroups[] => [
  {
    modality: 2,
    payeeType: 1,
    payeeName: 'thl',
    lines: [
      {
        mainCategoryId: '96febbda-2e4d-4868-a6c9-069715bd5a80',
        subCategoryId: 'c9e82f97-3f67-4fb7-90ad-663189813f41',
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

export const mockCaseFinancialAssistanceEntity = (force?: Partial<ICaseFinancialAssistanceEntity>, index = 0) : ICaseFinancialAssistanceEntity => ({
  ...mockBaseData(),
  id: mockBaseData().id + index,
  caseFileId: '21f78eff-7b48-46b6-a363-ed479011d572',
  financialAssistanceTableId: 'c05bd971-f0fe-4e3d-a20e-6a0c7c7bd52a',
  name: 'thl payment',
  description: 'thl payment desc',
  groups: mockCaseFinancialAssistancePaymentGroups(),
  paymentStatus: FPaymentStatus.New,
  ...force,
});

export const mockCaseFinancialAssistanceEntities = () : ICaseFinancialAssistanceEntity[] => ([
  mockCaseFinancialAssistanceEntity({ id: '1' }),
  mockCaseFinancialAssistanceEntity({ id: '2', paymentStatus: FPaymentStatus.InProgress }, 1),
]);

export const mockCombinedCaseFinancialAssistance = (force?: Partial<ICaseFinancialAssistanceEntity>): ICaseFinancialAssistanceCombined => ({
  entity: mockCaseFinancialAssistanceEntity(force),
  metadata: null,
});
