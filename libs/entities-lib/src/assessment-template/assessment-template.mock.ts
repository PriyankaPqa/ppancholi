import { IAzureCombinedSearchResult } from '@libs/core-lib/types';
import { mockBaseData, IEntity } from '../base';
import { IAssessmentTemplateCombined, IAssessmentTemplateEntity, IAssessmentTemplateMetadata } from './assessment-template.types';

export const mockAssessmentTemplateEntity = (force? : Partial<IAssessmentTemplateEntity>) : IAssessmentTemplateEntity => ({
  ...mockBaseData(),
  name: {
    translation: {
      en: 'Assessment Floods 2021',
      fr: 'Questions 2021',
    },
  },
  ...force,
});

export const mockAssessmentTemplateMetadata = (force? : Partial<IAssessmentTemplateMetadata>) : IAssessmentTemplateMetadata => ({
  ...mockBaseData(),
  assessmentTemplateStatusName: {
    translation: {
      en: 'Active',
      fr: 'Actif',
    },
  },
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

export const mockSearchData: IAzureCombinedSearchResult<IAssessmentTemplateEntity, IAssessmentTemplateMetadata> = {
  odataContext: 'https://emis-search-dev.search.windows.net/indexes("index-assessment-template")/$metadata#docs(*)',
  odataCount: 3,
  value: mockCombinedAssessmentTemplates().map((x) => ({
    id: x.entity.id, tenantId: x.entity.tenantId, entity: x.entity, metadata: x.metadata,
  })),
};
