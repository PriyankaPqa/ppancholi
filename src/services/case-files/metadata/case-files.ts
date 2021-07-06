import { ICaseFileMetadata } from '@/entities/case-file';
import { DomainBaseService } from '@/services/base';
import { IHttpClient } from '@/services/httpClient';
import { ICaseFilesMetadataService } from './case-files.types';

const apiUrlSuffix = 'case-file';
const controller = 'case-files/metadata';

export class CaseFilesMetadataService extends DomainBaseService<ICaseFileMetadata> implements ICaseFilesMetadataService {
  constructor(http: IHttpClient) {
    super(http, apiUrlSuffix, controller);
  }
}
