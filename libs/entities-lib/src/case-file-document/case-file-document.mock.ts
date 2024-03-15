import { mockOptionItemData } from '../optionItem';
import { mockBaseData } from '../base';
import {
  DocumentStatus, ICaseFileDocumentEntity,
} from './case-file-document.types';

export const mockCaseFileDocumentEntity = (force? : Partial<ICaseFileDocumentEntity>) : ICaseFileDocumentEntity => ({
  ...mockBaseData(),
  caseFileId: '38106287-9046-47b9-8981-76ede656d305',
  name: 'test referral',
  originalFilename: 'test_referral.pdf',
  note: 'notes...',
  category: {
    optionItemId: mockOptionItemData()[0].id,
    specifiedOther: null,
  },
  documentStatus: DocumentStatus.Past,
  ...force,
  validate: () => true,
});

export const mockCaseFileDocumentEntities = () : ICaseFileDocumentEntity[] => [
  mockCaseFileDocumentEntity({ id: '1' }),
  mockCaseFileDocumentEntity({ id: '2' }),
];
