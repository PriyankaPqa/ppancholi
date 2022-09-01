import { IAzureCombinedSearchResult } from '@libs/shared-lib/types';
import { mockBaseData, IEntity } from '../base';
import {
  AssessmentFormType, AssessmentFrequencyType, IAssessmentBaseEntity,
  IAssessmentBaseMetadata, IAssessmentFormCombined, IAssessmentFormEntity,
  IAssessmentFormMetadata, IAssessmentTemplateCombined, IAssessmentTemplateEntity,
  IAssessmentTemplateMetadata, PublishStatus, SurveyJsAssessmentFormState,
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
  questions: [],
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
  programId: '0f6c1714-045a-4054-8133-c96abb94782a',
  ...force,
});

export const mockAssessmentBaseMetadata = (force? : Partial<IAssessmentBaseMetadata>) : IAssessmentBaseMetadata => ({
  ...mockBaseData(),
  assessmentTemplateStatusName: {
    translation: {
      en: 'Active',
      fr: 'Actif',
    },
  },
  ...force,
});

export const mockAssessmentTemplateMetadata = (force? : Partial<IAssessmentTemplateMetadata>) : IAssessmentTemplateMetadata => ({
  ...mockAssessmentBaseMetadata(),
  ...force,
});

export const mockAssessmentFormMetadata = (force? : Partial<IAssessmentFormMetadata>) : IAssessmentFormMetadata => ({
  ...mockAssessmentBaseMetadata(),
  programName: {
    translation: {
      en: 'Prog EN',
      fr: 'Prog FR',
    },
  },
  totalSubmissions: 8,
  ...force,
});

export const mockAssessmentTemplateEntities = () : IAssessmentTemplateEntity[] => [
  mockAssessmentTemplateEntity({ id: '1' }),
  mockAssessmentTemplateEntity({ id: '2' }),
];

export const mockAssessmentTemplateMetadatum = () : IAssessmentTemplateMetadata[] => [
  mockAssessmentTemplateMetadata({ id: '1' }),
  mockAssessmentTemplateMetadata({ id: '2' }),
];

export const mockCombinedAssessmentTemplate = (force?: Partial<IEntity>): IAssessmentTemplateCombined => ({
  metadata: mockAssessmentTemplateMetadata(force),
  entity: mockAssessmentTemplateEntity(force),
});

export const mockCombinedAssessmentTemplates = (): IAssessmentTemplateCombined[] => [
  mockCombinedAssessmentTemplate({ id: '1' }),
  mockCombinedAssessmentTemplate({ id: '2' }),
  mockCombinedAssessmentTemplate({ id: '3' }),
];

export const mockAssessmentFormEntities = () : IAssessmentFormEntity[] => [
  mockAssessmentFormEntity({ id: '1' }),
  mockAssessmentFormEntity({ id: '2' }),
];

export const mockAssessmentFormMetadatum = () : IAssessmentFormMetadata[] => [
  mockAssessmentFormMetadata({ id: '1' }),
  mockAssessmentFormMetadata({ id: '2' }),
];

export const mockCombinedAssessmentForm = (force?: Partial<IEntity>): IAssessmentFormCombined => ({
  metadata: mockAssessmentFormMetadata(force),
  entity: mockAssessmentFormEntity(force),
});

export const mockCombinedAssessmentForms = (): IAssessmentFormCombined[] => [
  mockCombinedAssessmentForm({ id: '1' }),
  mockCombinedAssessmentForm({ id: '2' }),
  mockCombinedAssessmentForm({ id: '3' }),
];

export const mockSearchDataTemplate: IAzureCombinedSearchResult<IAssessmentTemplateEntity, IAssessmentTemplateMetadata> = {
  odataContext: 'https://emis-search-dev.search.windows.net/indexes("index-assessment-template")/$metadata#docs(*)',
  odataCount: 3,
  value: mockCombinedAssessmentTemplates().map((x) => ({
    id: x.entity.id, tenantId: x.entity.tenantId, entity: x.entity, metadata: x.metadata,
  })),
};

export const mockSearchDataForm: IAzureCombinedSearchResult<IAssessmentFormEntity, IAssessmentFormMetadata> = {
  odataContext: 'https://emis-search-dev.search.windows.net/indexes("index-assessment-form")/$metadata#docs(*)',
  odataCount: 3,
  value: mockCombinedAssessmentForms().map((x) => ({
    id: x.entity.id, tenantId: x.entity.tenantId, entity: x.entity, metadata: x.metadata,
  })),
};
