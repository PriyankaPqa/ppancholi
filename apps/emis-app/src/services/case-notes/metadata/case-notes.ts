import { ICaseNoteMetadata } from '@/entities/case-note';
import { DomainBaseService } from '@/services/base';
import { IHttpClient } from '@libs/core-lib/services/http-client';
import { ICaseNotesMetadataService } from './case-notes.types';

const apiUrlSuffix = 'case-file/case-files/{caseFileId}';
const controller = 'case-notes/metadata';

interface UrlParams { id: uuid, caseFileId: uuid }

export class CaseNotesMetadataService extends DomainBaseService<ICaseNoteMetadata, UrlParams> implements ICaseNotesMetadataService {
  constructor(http: IHttpClient) {
    super(http, apiUrlSuffix, controller);
  }
}
