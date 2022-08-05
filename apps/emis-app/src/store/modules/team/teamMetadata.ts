import { BaseModule } from '@/store/modules/base';
import { ITeamMetadata } from '@libs/entities-lib/team';

export class TeamMetadataModule extends BaseModule<ITeamMetadata, uuid> {}
