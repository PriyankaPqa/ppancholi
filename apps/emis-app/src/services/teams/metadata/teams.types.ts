import { ITeamMetadata } from '@/entities/team';
import { IDomainBaseService } from '@/services/base';

export interface ITeamsMetadataService extends IDomainBaseService<ITeamMetadata, uuid> {}
