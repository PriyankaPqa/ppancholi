import { ICaseNoteEntity } from '@/entities/case-note';

export interface ICaseNotesService {
  addCaseNote(id: uuid, caseNote: ICaseNoteEntity): Promise<ICaseNoteEntity>;
  pinCaseNote(id: uuid, caseNoteId: uuid, isPinned: boolean): Promise<ICaseNoteEntity>;
  editCaseNote(id: uuid, caseNoteId: uuid, caseNote: ICaseNoteEntity): Promise<ICaseNoteEntity>;
}

export interface ICaseNotesServiceMock {
  addCaseNote: jest.Mock<ICaseNoteEntity>;
  pinCaseNote: jest.Mock<ICaseNoteEntity>;
  editCaseNote: jest.Mock<ICaseNoteEntity>;
}
