import { ICaseNoteEntity } from '@libs/entities-lib/case-note';
import { IEntity } from '@libs/entities-lib/base';
import { IAzureCombinedSearchResult, IAzureSearchParams } from '@libs/shared-lib/types';
import { IHttpClient } from '../../http-client';

import { DomainBaseService } from '../../base';
import { ICaseNotesService } from './case-notes.types';

const API_URL_SUFFIX = 'case-file/case-files/{caseFileId}';
const CONTROLLER = 'case-notes';
interface UrlParams { id: uuid, caseFileId: uuid }

export class CaseNotesService extends DomainBaseService<ICaseNoteEntity, UrlParams> implements ICaseNotesService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, CONTROLLER);
  }

  async addCaseNote(id: uuid, caseNote: ICaseNoteEntity): Promise<ICaseNoteEntity> {
    return this.http.post(this.getItemUrl(`${this.baseUrl}`, { caseFileId: id }), {
      subject: caseNote.subject,
      description: caseNote.description,
      category: {
        optionItemId: caseNote.category.optionItemId,
      },
    });
  }

  async pinCaseNote(id: uuid, caseNoteId: uuid, isPinned: boolean): Promise<ICaseNoteEntity> {
    return this.http.patch(this.getItemUrl(`${this.baseUrl}/{id}/pin/${isPinned}`, { caseFileId: id, id: caseNoteId }));
  }

  async editCaseNote(id: uuid, caseNoteId: uuid, caseNote: ICaseNoteEntity): Promise<ICaseNoteEntity> {
    return this.http.patch(this.getItemUrl(`${this.baseUrl}/{id}/edit`, { caseFileId: id, id: caseNoteId }), {
      subject: caseNote.subject,
      description: caseNote.description,
      category: {
        optionItemId: caseNote.category.optionItemId,
      },
    });
  }

  async search(params: IAzureSearchParams):
    Promise<IAzureCombinedSearchResult<ICaseNoteEntity, IEntity>> {
      return this.http.get('case-file/search/case-notesV2', { params, isOData: true });
  }
}
