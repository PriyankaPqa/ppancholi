import {
  mockCaseFileMetadatum,
} from '@libs/entities-lib/case-file';
import { mockDomainBaseService } from '../../base';
import { ICaseFilesMetadataServiceMock } from './case-files.types';

export const mockCaseFilesMetadataService = (): ICaseFilesMetadataServiceMock => ({
  ...mockDomainBaseService(mockCaseFileMetadatum()),
});
