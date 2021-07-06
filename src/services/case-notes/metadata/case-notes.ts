import { ICaseNoteMetadata } from '@/entities/case-note';
import { DomainBaseService } from '@/services/base';
import { IHttpClient } from '@/services/httpClient';
import { ICaseNotesMetadataService } from './case-notes.types';

const apiUrlSuffix = 'case-file';
const controller = 'case-files/metadata';

export class CaseNotesMetadataService extends DomainBaseService<ICaseNoteMetadata> implements ICaseNotesMetadataService {
  constructor(http: IHttpClient) {
    super(http, apiUrlSuffix, controller);
  }
}
