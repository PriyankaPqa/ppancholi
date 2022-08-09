import { mockCaseFileDocumentEntities, mockCaseFileDocumentEntity } from '@libs/entities-lib/case-file-document';
import { mockDomainBaseService } from '../../base';
import { ICaseFileDocumentsServiceMock } from './case-file-documents.types';

export const mockCaseFileDocumentsService = (): ICaseFileDocumentsServiceMock => ({
  ...mockDomainBaseService(mockCaseFileDocumentEntities()),
  updateDocument: jest.fn(() => mockCaseFileDocumentEntity()),
  downloadDocumentAsUrl: jest.fn(() => 'fake url returned'),
});
