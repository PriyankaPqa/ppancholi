import { IdParams, ITaskMetadata } from '@libs/entities-lib/task';
import { IDomainBaseService } from '../../base';

export interface ITaskMetadataService extends IDomainBaseService<ITaskMetadata, IdParams> {}
