import { mockBaseData } from '@/entities/base';
import {
  DocumentStatus, ICaseFileDocumentCombined, ICaseFileDocumentEntity, ICaseFileDocumentMetadata,
} from './case-file-document.types';
import { IEntity } from '../base/base.types';

export const mockCaseFileDocumentEntity = (force? : Partial<ICaseFileDocumentEntity>) : ICaseFileDocumentEntity => ({
  ...mockBaseData(),
  caseFileId: '38106287-9046-47b9-8981-76ede656d305',
  name: 'test referral',
  note: 'notes...',
  category: {
    optionItemId: '09bda590-ad8b-4f29-af4e-c63eedd337a0',
    specifiedOther: null,
  },
  documentStatus: DocumentStatus.Past,
  ...force,
  validate: () => true,
});

export const mockCaseFileDocumentMetadata = (force? : Partial<ICaseFileDocumentMetadata>) : ICaseFileDocumentMetadata => ({
  ...mockBaseData(),
  documentCategoryName: {
    translation: {
      en: 'categoryNameEn',
      fr: 'categoryNameFr',
    },
  },
  documentStatusName: {
    translation: {
      en: 'statusEn',
      fr: 'statusFr',
    },
  },
  ...force,
});

export const mockCaseFileDocumentEntities = () : ICaseFileDocumentEntity[] => [
  mockCaseFileDocumentEntity({ id: '1' }),
  mockCaseFileDocumentEntity({ id: '2' }),
];

export const mockCaseFileDocumentMetadatum = () : ICaseFileDocumentMetadata[] => [
  mockCaseFileDocumentMetadata({ id: '1' }),
  mockCaseFileDocumentMetadata({ id: '2' }),
];

export const mockCombinedCaseFileDocument = (force?: Partial<IEntity>): ICaseFileDocumentCombined => ({
  metadata: mockCaseFileDocumentMetadata(force),
  entity: mockCaseFileDocumentEntity(force),
});

export const mockCombinedCaseFileDocuments = (): ICaseFileDocumentCombined[] => [
  mockCombinedCaseFileDocument({ id: '1' }),
  mockCombinedCaseFileDocument({ id: '2' }),
  mockCombinedCaseFileDocument({ id: '3' }),
];
