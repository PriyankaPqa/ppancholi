import { mockCaseFileDocumentEntities, mockCaseFileDocumentEntity } from '@/entities/case-file-document';
import { mockDomainBaseService } from '@libs/core-lib/services/base';
import { ICaseFileDocumentsServiceMock } from './case-file-documents.types';

export const mockCaseFileDocumentsService = (): ICaseFileDocumentsServiceMock => ({
  ...mockDomainBaseService(mockCaseFileDocumentEntities()),
  updateDocument: jest.fn(() => mockCaseFileDocumentEntity()),
  downloadDocumentAsUrl: jest.fn(() => 'fake url returned'),
});
