/* eslint-disable max-len */
import { IAzureCombinedSearchResult } from '@libs/shared-lib/types';
import { mockBaseData, IEntity } from '../base';
import {
  CompletionStatus,
  IAssessmentResponseCombined, IAssessmentResponseEntity,
  IAssessmentResponseMetadata,
} from './assessment-template.types';

export const mockAssessmentResponseEntity = (force?: Partial<IAssessmentResponseEntity>): IAssessmentResponseEntity => ({
  ...mockBaseData(),
  assessmentFormId: '044fcd68-3d70-4a3a-b5c8-22da9e01730f',
  association: { id: 'CaseFileId', type: 1 },
  completionStatus: CompletionStatus.Partial,
  uniqueUrl: 'http://localhost:8080/fr/events/38ff3de1-89d5-4437-993b-30da7448d9d3/assessment-complete/88435161-e658-4f9b-82bc-6ce3f94e358f/88435161-e658-4f9b-82bc-6ce3f94e358c',
  externalToolState: {
    tool: 'SurveyJs',
    data: {
      rawJson: JSON.stringify({
        question2: [
          'item1',
          'item2',
        ],
        question3: 'item2',
      }),
      denormalizedJson: '[{"name":"question2","title":"question2","value":["item1","item2"],"displayValue":"item1, item2","isNode":true,"questionType":"checkbox","data":[{"name":0,"title":"Choice","value":"item1","displayValue":"item1","isNode":false},{"name":1,"title":"Choice","value":"item2","displayValue":"item2","isNode":false}]},{"name":"question3","title":"question3","value":"item2","displayValue":"item2","isNode":true,"questionType":"radiogroup","data":[{"name":0,"title":"Choice","value":"item2","displayValue":"item2","isNode":false}]}]',
    },
  },
  answeredQuestions: [
    {
      assessmentQuestionIdentifier: 'question2',
      responses: [
        {
          displayValue: 'item1',
          textValue: 'item1',
          numericValue: null,
        },
        {
          displayValue: 'item2',
          textValue: 'item2',
          numericValue: null,
        },
      ],
    },
    {
      assessmentQuestionIdentifier: 'question3',
      responses: [
        {
          displayValue: 'item2',
          textValue: 'item2',
          numericValue: null,
        },
      ],
    },
  ],
  answeredQuestionsHistory: null,
  totalScore: 10,
  dateAssigned: new Date('2022-09-09T16:33:11.700Z'),
  dateStarted: new Date('2022-09-09T16:33:11.700Z'),
  dateCompleted: null,
  ...force,
});

export const mockAssessmentResponseMetadata = (force?: Partial<IAssessmentResponseMetadata>): IAssessmentResponseMetadata => ({
  ...mockBaseData(),
  ...force,
});

export const mockAssessmentResponseEntities = (): IAssessmentResponseEntity[] => [
  mockAssessmentResponseEntity({ id: '1' }),
  mockAssessmentResponseEntity({ id: '2' }),
];

export const mockAssessmentResponseMetadatum = (): IAssessmentResponseMetadata[] => [
  mockAssessmentResponseMetadata({ id: '1' }),
  mockAssessmentResponseMetadata({ id: '2' }),
];

export const mockCombinedAssessmentResponse = (force?: Partial<IEntity>): IAssessmentResponseCombined => ({
  metadata: mockAssessmentResponseMetadata(force),
  entity: mockAssessmentResponseEntity(force),
});

export const mockCombinedAssessmentResponses = (): IAssessmentResponseCombined[] => [
  mockCombinedAssessmentResponse({ id: '1' }),
  mockCombinedAssessmentResponse({ id: '2' }),
  mockCombinedAssessmentResponse({ id: '3' }),
];

export const mockSearchDataResponse: IAzureCombinedSearchResult<IAssessmentResponseEntity, IAssessmentResponseMetadata> = {
  odataContext: 'https://emis-search-dev.search.windows.net/indexes("index-assessment-response")/$metadata#docs(*)',
  odataCount: 3,
  value: mockCombinedAssessmentResponses().map((x) => ({
    id: x.entity.id, tenantId: x.entity.tenantId, entity: x.entity, metadata: x.metadata,
  })),
};
