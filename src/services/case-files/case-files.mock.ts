import { mockSearchCaseFiles } from '@/entities/case-file';
import { ICaseFilesServiceMock } from './case-files.types';

export const mockCaseFilesService = (): ICaseFilesServiceMock => ({
  searchCaseFiles: jest.fn(() => mockSearchCaseFiles()),
});
