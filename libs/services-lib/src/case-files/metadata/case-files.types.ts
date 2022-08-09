import { ICaseFileMetadata } from '@libs/entities-lib/case-file';
import { IDomainBaseService, IDomainBaseServiceMock } from '../../base';

export interface ICaseFilesMetadataService extends IDomainBaseService<ICaseFileMetadata, uuid> {
  getSummary(id: uuid): Promise<ICaseFileMetadata>;
}

export interface ICaseFilesMetadataServiceMock extends IDomainBaseServiceMock<ICaseFileMetadata>{
  getSummary: jest.Mock<ICaseFileMetadata>;
}
