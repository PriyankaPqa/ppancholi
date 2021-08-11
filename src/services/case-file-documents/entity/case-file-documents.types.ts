import { ICaseFileDocumentEntity } from '@/entities/case-file-document';

export interface ICaseFileDocumentsService {
  updateDocument(item: ICaseFileDocumentEntity): Promise<ICaseFileDocumentEntity>;
}

export interface ICaseFileDocumentsServiceMock {
  updateDocument: jest.Mock<ICaseFileDocumentEntity>;
}
