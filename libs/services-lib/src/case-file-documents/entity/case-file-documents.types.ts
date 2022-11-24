import { ICaseFileDocumentEntity } from '@libs/entities-lib/case-file-document';
import { IDomainBaseService, IDomainBaseServiceMock } from '../../base';

export interface ICaseFileDocumentsService extends IDomainBaseService<ICaseFileDocumentEntity, { id: uuid, caseFileId: uuid }> {
  updateDocument(item: ICaseFileDocumentEntity): Promise<ICaseFileDocumentEntity>;
  downloadDocumentAsUrl(item: ICaseFileDocumentEntity, saveDownloadedFile: boolean): Promise<string>;
}

export interface ICaseFileDocumentsServiceMock extends IDomainBaseServiceMock<ICaseFileDocumentEntity> {
  updateDocument: jest.Mock<ICaseFileDocumentEntity>;
  downloadDocumentAsUrl: jest.Mock<string>;
}
