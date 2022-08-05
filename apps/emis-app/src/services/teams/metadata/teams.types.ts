import { ITeamMetadata } from '@libs/entities-lib/team';
import { IDomainBaseService } from '@libs/core-lib/services/base';

export interface ITeamsMetadataService extends IDomainBaseService<ITeamMetadata, uuid> {}
