import { IdParams, ITaskMetadata } from '@libs/entities-lib/task';
import { DomainBaseService } from '../../base';
import { IHttpClient } from '../../http-client';
import { ITaskMetadataService } from './task.types';

const apiUrlSuffix = 'case-file/case-files/{caseFileId}';
const controller = 'tasks/metadata';

export class TaskMetadataService extends DomainBaseService<ITaskMetadata, IdParams> implements ITaskMetadataService {
  constructor(http: IHttpClient) {
    super(http, apiUrlSuffix, controller);
  }
}
