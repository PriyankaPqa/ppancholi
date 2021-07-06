import { mockCaseNoteEntity } from '@/entities/case-note';
import { ICaseNotesServiceMock } from './case-notes.types';

export const mockCaseNotesService = (): ICaseNotesServiceMock => ({
  addCaseNote: jest.fn(() => mockCaseNoteEntity()),
  pinCaseNote: jest.fn(() => mockCaseNoteEntity()),
  editCaseNote: jest.fn(() => mockCaseNoteEntity()),
});
