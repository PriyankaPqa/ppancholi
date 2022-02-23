import { ICaseNoteEntity } from '@/entities/case-note';
import { DomainBaseService } from '@/services/base';
import { IHttpClient } from '@/services/httpClient';

import { ICaseNotesService } from './case-notes.types';

const API_URL_SUFFIX = 'case-file';
const CONTROLLER = 'case-files';

export class CaseNotesService extends DomainBaseService<ICaseNoteEntity, uuid> implements ICaseNotesService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, CONTROLLER);
  }

  async addCaseNote(id: uuid, caseNote: ICaseNoteEntity): Promise<ICaseNoteEntity> {
    return this.http.post(`${this.baseUrl}/${id}/case-notes`, {
      subject: caseNote.subject,
      description: caseNote.description,
      category: {
        optionItemId: caseNote.category.optionItemId,
      },
    });
  }

  async pinCaseNote(id: uuid, caseNoteId: uuid, isPinned: boolean): Promise<ICaseNoteEntity> {
    return this.http.patch(`${this.baseUrl}/${id}/case-notes/${caseNoteId}/pin/${isPinned}`);
  }

  async editCaseNote(id: uuid, caseNoteId: uuid, caseNote: ICaseNoteEntity): Promise<ICaseNoteEntity> {
    return this.http.patch(`${this.baseUrl}/${id}/case-notes/${caseNoteId}/edit`, {
      subject: caseNote.subject,
      description: caseNote.description,
      category: {
        optionItemId: caseNote.category.optionItemId,
      },
    });
  }
}
