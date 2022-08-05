import {
  mockCaseFileMetadatum, mockCaseFileMetadata,
} from '@libs/entities-lib/case-file';
import { mockDomainBaseService } from '@libs/core-lib/services/base';
import { ICaseFilesMetadataServiceMock } from './case-files.types';

export const mockCaseFilesMetadataService = (): ICaseFilesMetadataServiceMock => ({
  ...mockDomainBaseService(mockCaseFileMetadatum()),
  getSummary: jest.fn(() => mockCaseFileMetadata()),
});
