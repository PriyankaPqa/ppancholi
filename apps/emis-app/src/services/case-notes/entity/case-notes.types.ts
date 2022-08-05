import { ICaseNoteEntity } from '@libs/entities-lib/case-note';
import { IDomainBaseService, IDomainBaseServiceMock } from '@libs/core-lib/services/base';

export interface ICaseNotesService extends IDomainBaseService<ICaseNoteEntity, uuid>{
  addCaseNote(id: uuid, caseNote: ICaseNoteEntity): Promise<ICaseNoteEntity>;
  pinCaseNote(id: uuid, caseNoteId: uuid, isPinned: boolean): Promise<ICaseNoteEntity>;
  editCaseNote(id: uuid, caseNoteId: uuid, caseNote: ICaseNoteEntity): Promise<ICaseNoteEntity>;
}

export interface ICaseNotesServiceMock extends IDomainBaseServiceMock<ICaseNoteEntity>{
  addCaseNote: jest.Mock<ICaseNoteEntity>;
  pinCaseNote: jest.Mock<ICaseNoteEntity>;
  editCaseNote: jest.Mock<ICaseNoteEntity>;
}
