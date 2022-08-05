import { mockCaseNoteEntities, mockCaseNoteEntity } from '@libs/entities-lib/case-note';
import { mockDomainBaseService } from '@libs/core-lib/services/base';
import { ICaseNotesServiceMock } from './case-notes.types';

export const mockCaseNotesService = (): ICaseNotesServiceMock => ({
  ...mockDomainBaseService(mockCaseNoteEntities()),
  addCaseNote: jest.fn(() => mockCaseNoteEntity()),
  pinCaseNote: jest.fn(() => mockCaseNoteEntity()),
  editCaseNote: jest.fn(() => mockCaseNoteEntity()),
});
