import { ICaseFileMetadata } from '@libs/entities-lib/case-file';
import { IHttpClient } from '../../http-client';
import { DomainBaseService } from '../../base';
import { ICaseFilesMetadataService } from './case-files.types';

const apiUrlSuffix = 'case-file';
const controller = 'case-files/metadata';

export class CaseFilesMetadataService extends DomainBaseService<ICaseFileMetadata, uuid> implements ICaseFilesMetadataService {
  constructor(http: IHttpClient) {
    super(http, apiUrlSuffix, controller);
  }
}
