import { ICaseNoteMetadata } from '@libs/entities-lib/case-note';
import { IHttpClient } from '../../http-client';
import { DomainBaseService } from '../../base';
import { ICaseNotesMetadataService } from './case-notes.types';

const apiUrlSuffix = 'case-file/case-files/{caseFileId}';
const controller = 'case-notes/metadata';

interface UrlParams { id: uuid, caseFileId: uuid }

export class CaseNotesMetadataService extends DomainBaseService<ICaseNoteMetadata, UrlParams> implements ICaseNotesMetadataService {
  constructor(http: IHttpClient) {
    super(http, apiUrlSuffix, controller);
  }
}
