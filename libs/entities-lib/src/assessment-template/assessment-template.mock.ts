/* eslint-disable max-lines-per-function */
import { ISearchResult } from '@libs/shared-lib/types';
import { mockBaseData } from '../base';
import {
  AssessmentFormType, AssessmentFrequencyType, IAssessmentBaseEntity,
  IAssessmentFormEntity, IAssessmentTemplateEntity,
  IAssessmentTotalSubmissions, PublishStatus, SurveyJsAssessmentFormState,
} from './assessment-template.types';

export const mockAssessmentBaseEntity = (force? : Partial<IAssessmentTemplateEntity>) : IAssessmentBaseEntity => ({
  ...mockBaseData(),
  name: {
    translation: {
      en: 'Assessment Floods 2021',
      fr: 'Questions 2021',
    },
  },
  description: {
    translation: {
      en: 'DESC en',
      fr: 'DESC fr',
    },
  },
  messageIfUnavailable: {
    translation: {
      en: 'unavailable en',
      fr: 'unavailable fr',
    },
  },
  publishStatus: PublishStatus.Published,
  assessmentFormType: AssessmentFormType.AssessmentForm,
  externalToolState: new SurveyJsAssessmentFormState('{"logoPosition":"right"}'),
  savePartialSurveyResults: false,
  frequency: AssessmentFrequencyType.Multiple,
  questions: [
    {
      identifier: 'question1',
      id: 'question1id',
      questionType: 'text',
      question: {
        translation: {
          en: 'question1',
          fr: 'question1',
        },
      },
      answerChoices: null,
    },
    {
      identifier: 'question2',
      id: 'question2id',
      questionType: 'checkbox',
      question: {
        translation: {
          en: 'question2',
          fr: 'question2',
        },
      },
      answerChoices: [
        {
          identifier: 'item1',
          displayValue: {
            translation: {
              en: 'item1',
              fr: 'item1',
            },
          },
          textValue: 'item1',
          score: null,
        },
        {
          identifier: 'item2',
          displayValue: {
            translation: {
              en: 'item2',
              fr: 'item2',
            },
          },
          textValue: 'item2',
          score: null,
        },
        {
          identifier: 'item3',
          displayValue: {
            translation: {
              en: 'item3',
              fr: 'item3',
            },
          },
          textValue: 'item3',
          score: null,
        },
        {
          identifier: 'other',
          displayValue: {
            translation: {
              en: 'Other (describe)',
              fr: 'Autre (préciser)',
            },
          },
          textValue: 'other',
          score: null,
        },
      ],
    },
    {
      identifier: 'question2|Comment',
      id: 'question2|Commentid',
      questionType: 'text',
      question: {
        translation: {
          en: 'question2|Comment',
          fr: 'question2|Commentaires',
        },
      },
      answerChoices: null,
    },
    {
      identifier: 'question3',
      id: 'question3id',
      questionType: 'checkbox',
      question: {
        translation: {
          en: 'question3',
          fr: 'question3',
        },
      },
      answerChoices: [
        {
          identifier: 'item1',
          displayValue: {
            translation: {
              en: 'item1',
              fr: 'item1',
            },
          },
          textValue: 'item1',
          score: null,
        },
        {
          identifier: 'item2',
          displayValue: {
            translation: {
              en: 'item2',
              fr: 'item2',
            },
          },
          textValue: 'item2',
          score: null,
        },
        {
          identifier: 'item3',
          displayValue: {
            translation: {
              en: 'item3',
              fr: 'item3',
            },
          },
          textValue: 'item3',
          score: null,
        },
      ],
    },
    {
      identifier: 'question4',
      id: 'question4id',
      questionType: 'text',
      question: {
        translation: {
          en: 'question4',
          fr: 'question4',
        },
      },
      answerChoices: null,
    },
  ],
  scoringRanges: [{ minValue: 0, maxValue: 5, label: { translation: { en: 'less', fr: 'moins' } }, restrictFinancial: false },
    { minValue: 6, maxValue: 10, label: { translation: { en: 'more', fr: 'plus' } }, restrictFinancial: true }],
  ...force,
});

export const mockAssessmentTemplateEntity = (force? : Partial<IAssessmentTemplateEntity>) : IAssessmentTemplateEntity => ({
  ...mockAssessmentBaseEntity(),
  assessmentFormType: AssessmentFormType.AssessmentTemplate,
  ...force,
});

export const mockAssessmentFormEntity = (force? : Partial<IAssessmentFormEntity>) : IAssessmentFormEntity => ({
  ...mockAssessmentBaseEntity(),
  assessmentFormType: AssessmentFormType.AssessmentForm,
  eventId: '044fcd68-3d70-4a3a-b5c8-22da9e01730f',
  programId: '1',
  ...force,
});

export const mockAssessmentTotalSubmissions = (force? : Partial<IAssessmentTotalSubmissions>) : IAssessmentTotalSubmissions => ({
  ...mockAssessmentBaseEntity(),
  totalCompleted: 1,
  totalPartialCompleted: 1,
  totalAssigned: 8,
  ...force,
});

export const mockAssessmentFormEntityWithPanels = (force? : Partial<IAssessmentFormEntity>) : IAssessmentFormEntity => ({
  ...mockAssessmentBaseEntity(),
  assessmentFormType: AssessmentFormType.AssessmentForm,
  eventId: '044fcd68-3d70-4a3a-b5c8-22da9e01730f',
  programId: '1',
  externalToolState: {
    tool: 'SurveyJs',
    data: {
      rawJson: '{\n "logo": {\n  "default": "https://api-lab.crc-tech.ca/system-management/tenant-settings/c400f50d-7a56-4ef2-8e44-211bfa434724/logo/en",\n  "fr": "https://api-lab.crc-tech.ca/system-management/tenant-settings/c400f50d-7a56-4ef2-8e44-211bfa434724/logo/fr"\n },\n "logoPosition": "right",\n "pages": [\n  {\n   "name": "page1",\n   "elements": [\n    {\n     "type": "paneldynamic",\n     "name": "panel1",\n     "title": "panel 1 title en",\n     "templateElements": [\n      {\n       "type": "dropdown",\n       "name": "ddq",\n       "hasComment": true,\n       "choices": [\n        {\n         "value": "item1",\n         "score": 1\n        },\n        {\n         "value": "item2",\n         "score": 2\n        },\n        {\n         "value": "item3",\n         "score": 3\n        }\n       ],\n       "hasNone": true\n      },\n      {\n       "type": "text",\n       "name": "question4"\n      },\n      {\n       "type": "paneldynamic",\n       "name": "question1",\n       "templateElements": [\n        {\n         "type": "checkbox",\n         "name": "question2",\n         "choices": [\n          {\n           "value": "item1",\n           "text": {\n            "default": "nom en",\n            "fr": "nopm fr"\n           },\n           "score": 10\n          },\n          {\n           "value": "item2",\n           "score": 20\n          },\n          {\n           "value": "item3",\n           "score": 30\n          }\n         ],\n         "hasOther": true\n        }\n       ]\n      }\n     ]\n    },\n    {\n     "type": "boolean",\n     "name": "question3"\n    }\n   ]\n  }\n ],\n "clearInvisibleValues": "onHiddenContainer"\n}',
    },
  },
  questions: [
    {
      identifier: 'panel1',
      id: 'panel1id',
      question: {
        translation: {
          en: 'panel 1 title en',
          fr: 'panel 1 title en',
        },
      },
      questionType: 'paneldynamic',
      score: null,
      answerChoices: null,
    },
    {
      identifier: 'panel1|ddq',
      id: 'panel1|ddqid',
      question: {
        translation: {
          en: 'ddq',
          fr: 'ddq',
        },
      },
      questionType: 'dropdown',
      score: null,
      answerChoices: [
        {
          identifier: 'item1',
          displayValue: {
            translation: {
              en: 'item1',
              fr: 'item1',
            },
          },
          textValue: 'item1',
          numericValue: null,
          score: 1,
        },
        {
          identifier: 'item2',
          displayValue: {
            translation: {
              en: 'item2',
              fr: 'item2',
            },
          },
          textValue: 'item2',
          numericValue: null,
          score: 2,
        },
        {
          identifier: 'item3',
          displayValue: {
            translation: {
              en: 'item3',
              fr: 'item3',
            },
          },
          textValue: 'item3',
          numericValue: null,
          score: 3,
        },
        {
          identifier: 'none',
          displayValue: {
            translation: {
              en: 'None',
              fr: 'Aucun',
            },
          },
          textValue: 'none',
          numericValue: null,
          score: null,
        },
      ],
    },
    {
      identifier: 'panel1|ddq|Comment',
      id: 'panel1|ddq|Commentid',
      question: {
        translation: {
          en: 'ddq|Comment',
          fr: 'ddq|Commentaires',
        },
      },
      questionType: 'comment',
      score: null,
      answerChoices: null,
    },
    {
      identifier: 'panel1|question4',
      id: 'panel1|question4id',
      question: {
        translation: {
          en: 'question4',
          fr: 'question4',
        },
      },
      questionType: 'text',
      score: null,
      answerChoices: null,
    },
    {
      identifier: 'panel1|question1',
      id: 'panel1|question1id',
      question: {
        translation: {
          en: 'question1',
          fr: 'question1',
        },
      },
      questionType: 'paneldynamic',
      score: null,
      answerChoices: null,
    },
    {
      identifier: 'panel1|question1|question2',
      id: 'panel1|question1|question2id',
      question: {
        translation: {
          en: 'question2',
          fr: 'question2',
        },
      },
      questionType: 'checkbox',
      score: null,
      answerChoices: [
        {
          identifier: 'item1',
          displayValue: {
            translation: {
              en: 'nom en',
              fr: 'nopm fr',
            },
          },
          textValue: 'item1',
          numericValue: null,
          score: 10,
        },
        {
          identifier: 'item2',
          displayValue: {
            translation: {
              en: 'item2',
              fr: 'item2',
            },
          },
          textValue: 'item2',
          numericValue: null,
          score: 20,
        },
        {
          identifier: 'item3',
          displayValue: {
            translation: {
              en: 'item3',
              fr: 'item3',
            },
          },
          textValue: 'item3',
          numericValue: null,
          score: 30,
        },
        {
          identifier: 'other',
          displayValue: {
            translation: {
              en: 'Other (describe)',
              fr: 'Autre (préciser)',
            },
          },
          textValue: 'other',
          numericValue: null,
          score: null,
        },
      ],
    },
    {
      identifier: 'panel1|question1|question2|Comment',
      id: 'panel1|question1|question2|Commentid',
      question: {
        translation: {
          en: 'question2|Comment',
          fr: 'question2|Commentaires',
        },
      },
      questionType: 'comment',
      score: null,
      answerChoices: null,
    },
    {
      identifier: 'question3',
      id: 'question3id',
      question: {
        translation: {
          en: 'question3',
          fr: 'question3',
        },
      },
      questionType: 'boolean',
      score: null,
      answerChoices: [
        {
          identifier: 'true',
          displayValue: {
            translation: {
              en: 'Yes',
              fr: 'Oui',
            },
          },
          textValue: 'true',
          numericValue: null,
          score: null,
        },
        {
          identifier: 'false',
          displayValue: {
            translation: {
              en: 'No',
              fr: 'Non',
            },
          },
          textValue: 'false',
          numericValue: null,
          score: null,
        },
      ],
    },
  ],
  ...force,
});

export const mockAssessmentTemplateEntities = () : IAssessmentTemplateEntity[] => [
  mockAssessmentTemplateEntity({ id: '1' }),
  mockAssessmentTemplateEntity({ id: '2' }),
];

export const mockAssessmentFormEntities = () : IAssessmentFormEntity[] => [
  mockAssessmentFormEntity({ id: '1' }),
  mockAssessmentFormEntity({ id: '2' }),
];

export const mockSearchDataForm: ISearchResult<IAssessmentFormEntity> = {
  odataContext: 'https://emis-search-dev.search.windows.net/indexes("index-assessment-form")/$metadata#docs(*)',
  odataCount: 3,
  value: mockAssessmentFormEntities().map((x) => ({ ...x, id: x.id, tenantId: x.tenantId })),
};
