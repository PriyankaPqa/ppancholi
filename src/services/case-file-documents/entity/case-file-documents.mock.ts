import { mockCaseFileDocumentEntities, mockCaseFileDocumentEntity } from '@/entities/case-file-document';
import { ICaseFileDocumentsServiceMock } from './case-file-documents.types';
import { mockDomainBaseService } from '@/services/base/base.mock';

export const mockCaseFileDocumentsService = (): ICaseFileDocumentsServiceMock => ({
  ...mockDomainBaseService(mockCaseFileDocumentEntities()),
  updateDocument: jest.fn(() => mockCaseFileDocumentEntity()),
  downloadDocumentAsUrl: jest.fn(() => 'fake url returned'),
});
