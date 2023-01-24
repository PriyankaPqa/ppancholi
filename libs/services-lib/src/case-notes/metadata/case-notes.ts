import { ICaseNoteMetadata, IdMetadataParams } from '@libs/entities-lib/case-note';
import { IHttpClient } from '../../http-client';
import { DomainBaseService } from '../../base';
import { ICaseNotesMetadataService } from './case-notes.types';

const apiUrlSuffix = 'case-file/case-files/{caseFileId}';
const controller = 'case-notes/metadata';

export class CaseNotesMetadataService extends DomainBaseService<ICaseNoteMetadata, IdMetadataParams> implements ICaseNotesMetadataService {
  constructor(http: IHttpClient) {
    super(http, apiUrlSuffix, controller);
  }
}
