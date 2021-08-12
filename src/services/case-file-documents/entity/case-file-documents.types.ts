import { ICaseFileDocumentEntity } from '@/entities/case-file-document';

export interface ICaseFileDocumentsService {
  updateDocument(item: ICaseFileDocumentEntity): Promise<ICaseFileDocumentEntity>;
  downloadDocumentAsUrl(item: ICaseFileDocumentEntity, saveDownloadedFile: boolean): Promise<string>;
}

export interface ICaseFileDocumentsServiceMock {
  updateDocument: jest.Mock<ICaseFileDocumentEntity>;
  downloadDocumentAsUrl: jest.Mock<string>;
}
