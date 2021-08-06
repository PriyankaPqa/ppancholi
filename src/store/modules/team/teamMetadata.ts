import { BaseModule } from '@/store/modules/base';
import { ITeamMetadata } from '@/entities/team';

export class TeamMetadataModule extends BaseModule<ITeamMetadata, uuid> {}
