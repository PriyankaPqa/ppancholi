import { ITeamMetadata } from '@/entities/team';
import { DomainBaseService } from '@libs/core-lib/services/base';
import { IHttpClient } from '@libs/core-lib/services/http-client';
import { ITeamsMetadataService } from './teams.types';

const apiUrlSuffix = 'team';
const controller = 'teams/metadata';

export class TeamsMetadataService extends DomainBaseService<ITeamMetadata, uuid> implements ITeamsMetadataService {
  constructor(http: IHttpClient) {
    super(http, apiUrlSuffix, controller);
  }
}
