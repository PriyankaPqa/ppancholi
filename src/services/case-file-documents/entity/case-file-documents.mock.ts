import { mockCaseFileDocumentEntity } from '@/entities/case-file-document';
import { ICaseFileDocumentsServiceMock } from './case-file-documents.types';

export const mockCaseFileDocumentsService = (): ICaseFileDocumentsServiceMock => ({
  updateDocument: jest.fn(() => mockCaseFileDocumentEntity()),
  downloadDocumentAsUrl: jest.fn(() => 'fake url returned'),
});
