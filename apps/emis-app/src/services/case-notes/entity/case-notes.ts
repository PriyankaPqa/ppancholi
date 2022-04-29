import { ICaseNoteEntity, ICaseNoteMetadata } from '@/entities/case-note';
import { DomainBaseService } from '@libs/core-lib/services/base';
import { IHttpClient } from '@libs/core-lib/services/http-client';

import { IAzureCombinedSearchResult, IAzureSearchParams } from '@libs/core-lib/types';
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

  async search(params: IAzureSearchParams, searchEndpoint: string = null):
    Promise<IAzureCombinedSearchResult<ICaseNoteEntity, ICaseNoteMetadata>> {
    return this.http.get(`${API_URL_SUFFIX}/search/${searchEndpoint ?? 'case-notes'}`, { params, isOData: true });
  }
}
