/* eslint-disable max-len, vue/max-len */
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
      questionId: 'question2id',
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
      questionId: 'question3id',
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

export const mockAssessmentResponseEntityWithPanels = (force?: Partial<IAssessmentResponseEntity>): IAssessmentResponseEntity => ({
  ...mockAssessmentResponseEntity(),
  answeredQuestions: [
    {
      assessmentQuestionIdentifier: 'panel1|ddq',
      questionId: 'panel1|ddqid',
      responses: [
        {
          displayValue: 'item2',
          textValue: 'item2',
          numericValue: null,
        },
      ],
      crcUserId: null,
      crcUserName: null,
      answeredOn: null,
      parentIndexPath: 'panel1[0]|',
    },
    {
      assessmentQuestionIdentifier: 'panel1|ddq|Comment',
      questionId: 'panel1|ddq|Commentid',
      responses: [
        {
          displayValue: 'tsetz',
          textValue: 'tsetz',
          numericValue: null,
        },
      ],
      crcUserId: null,
      crcUserName: null,
      answeredOn: null,
      parentIndexPath: 'panel1[0]|',
    },
    {
      assessmentQuestionIdentifier: 'panel1|ddq',
      questionId: 'panel1|ddqid',
      responses: [
        {
          displayValue: 'Aucun',
          textValue: 'none',
          numericValue: null,
        },
      ],
      crcUserId: null,
      crcUserName: null,
      answeredOn: null,
      parentIndexPath: 'panel1[1]|',
    },
    {
      assessmentQuestionIdentifier: 'panel1|question4',
      questionId: 'panel1|question4id',
      responses: [
        {
          displayValue: 'seteestet',
          textValue: 'seteestet',
          numericValue: null,
        },
      ],
      crcUserId: null,
      crcUserName: null,
      answeredOn: null,
      parentIndexPath: 'panel1[1]|',
    },
    {
      assessmentQuestionIdentifier: 'panel1|question1|question2',
      questionId: 'panel1|question1|question2id',
      responses: [
        {
          displayValue: 'Autre (préciser)',
          textValue: 'other',
          numericValue: null,
        },
        {
          displayValue: 'nopm fr',
          textValue: 'item1',
          numericValue: null,
        },
        {
          displayValue: 'item2',
          textValue: 'item2',
          numericValue: null,
        },
        {
          displayValue: 'item3',
          textValue: 'item3',
          numericValue: null,
        },
      ],
      crcUserId: null,
      crcUserName: null,
      answeredOn: null,
      parentIndexPath: 'panel1[1]|question1[0]|',
    },
    {
      assessmentQuestionIdentifier: 'panel1|question1|question2|Comment',
      questionId: 'panel1|question1|question2|Commentid',
      responses: [
        {
          displayValue: 'sd',
          textValue: 'sd',
          numericValue: null,
        },
      ],
      crcUserId: null,
      crcUserName: null,
      answeredOn: null,
      parentIndexPath: 'panel1[1]|question1[0]|',
    },
    {
      assessmentQuestionIdentifier: 'panel1|question1|question2',
      questionId: 'panel1|question1|question2id',
      responses: [
        {
          displayValue: 'nopm fr',
          textValue: 'item1',
          numericValue: null,
        },
        {
          displayValue: 'item2',
          textValue: 'item2',
          numericValue: null,
        },
      ],
      crcUserId: null,
      crcUserName: null,
      answeredOn: null,
      parentIndexPath: 'panel1[1]|question1[1]|',
    },
    {
      assessmentQuestionIdentifier: 'question3',
      questionId: 'question3id',
      responses: [
        {
          displayValue: 'Non',
          textValue: 'false',
          numericValue: null,
        },
      ],
      crcUserId: null,
      crcUserName: null,
      answeredOn: null,
      parentIndexPath: null,
    },
  ],
  externalToolState: {
    tool: 'SurveyJs',
    data: {
      rawJson: '{"panel1":[{"ddq":"item2","ddq-Comment":"tsetz"},{"ddq":"none","question4":"seteestet","question1":[{"question2":["other","item1","item2","item3"],"question2-Comment":"sd"},{"question2":["item1","item2"]}]}],"_currentPageNo":0,"question3":false}',
      denormalizedJson: '[{"name":"panel1","title":"panel 1 title en","value":[{"ddq":"item2","ddq-Comment":"tsetz"},{"ddq":"none","question4":"seteestet","question1":[{"question2":["other","item1","item2","item3"],"question2-Comment":"sd"},{"question2":["item1","item2"]}]}],"displayValue":[{"ddq":"item2","ddq-Comment":"tsetz"},{"ddq":"Aucun","question4":"seteestet","question1":[{"question2":"sd, nopm fr, item2, item3","question2-Comment":"sd"},{"question2":"nopm fr, item2"}]}],"isNode":true,"questionType":"paneldynamic","data":[{"name":0,"title":"Panel","value":{"ddq":"item2","ddq-Comment":"tsetz"},"displayValue":{"ddq":"item2","ddq-Comment":"tsetz"},"isNode":true,"data":[{"name":"ddq","title":"ddq","value":"item2","displayValue":"item2","isNode":true,"questionType":"dropdown","data":[{"name":0,"isComment":true,"title":"Comment","value":"-Comment","displayValue":"tsetz","isNode":false},{"name":0,"title":"Choice","value":"item2","displayValue":"item2","isNode":false}]}]},{"name":1,"title":"Panel","value":{"ddq":"none","question4":"seteestet","question1":[{"question2":["other","item1","item2","item3"],"question2-Comment":"sd"},{"question2":["item1","item2"]}]},"displayValue":{"ddq":"none","question4":"seteestet","question1":[{"question2":["other","item1","item2","item3"],"question2-Comment":"sd"},{"question2":["item1","item2"]}]},"isNode":true,"data":[{"name":"ddq","title":"ddq","value":"none","displayValue":"Aucun","isNode":true,"questionType":"dropdown","data":[{"name":0,"isComment":true,"title":"Comment","value":"-Comment","isNode":false},{"name":0,"title":"Choice","value":"none","displayValue":"Aucun","isNode":false}]},{"name":"question4","title":"question4","value":"seteestet","displayValue":"seteestet","isNode":false,"questionType":"text"},{"name":"question1","title":"question1","value":[{"question2":["other","item1","item2","item3"],"question2-Comment":"sd"},{"question2":["item1","item2"]}],"displayValue":[{"question2":"sd, nopm fr, item2, item3","question2-Comment":"sd"},{"question2":"nopm fr, item2"}],"isNode":true,"questionType":"paneldynamic","data":[{"name":0,"title":"Panel","value":{"question2":["other","item1","item2","item3"],"question2-Comment":"sd"},"displayValue":{"question2":["other","item1","item2","item3"],"question2-Comment":"sd"},"isNode":true,"data":[{"name":"question2","title":"question2","value":["other","item1","item2","item3"],"displayValue":"sd, nopm fr, item2, item3","isNode":true,"questionType":"checkbox","data":[{"name":0,"title":"Choice","value":"other","displayValue":"sd","isNode":false,"isOther":true},{"name":1,"title":"Choice","value":"item1","displayValue":"nopm fr","isNode":false},{"name":2,"title":"Choice","value":"item2","displayValue":"item2","isNode":false},{"name":3,"title":"Choice","value":"item3","displayValue":"item3","isNode":false}]}]},{"name":1,"title":"Panel","value":{"question2":["item1","item2"]},"displayValue":{"question2":["item1","item2"]},"isNode":true,"data":[{"name":"question2","title":"question2","value":["item1","item2"],"displayValue":"nopm fr, item2","isNode":true,"questionType":"checkbox","data":[{"name":0,"title":"Choice","value":"item1","displayValue":"nopm fr","isNode":false},{"name":1,"title":"Choice","value":"item2","displayValue":"item2","isNode":false}]}]}]}]}]},{"name":"question3","title":"question3","value":false,"displayValue":"Non","isNode":false,"questionType":"boolean"}]',
    },
  },
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
