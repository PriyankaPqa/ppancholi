import { mockCaseNoteEntities, mockCaseNoteEntity } from '@/entities/case-note';
import { mockDomainBaseService } from '@/services/base/base.mock';
import { ICaseNotesServiceMock } from './case-notes.types';

export const mockCaseNotesService = (): ICaseNotesServiceMock => ({
  ...mockDomainBaseService(mockCaseNoteEntities()),
  addCaseNote: jest.fn(() => mockCaseNoteEntity()),
  pinCaseNote: jest.fn(() => mockCaseNoteEntity()),
  editCaseNote: jest.fn(() => mockCaseNoteEntity()),
});
