import { ITeamMetadata } from '@/entities/team';
import { DomainBaseService } from '@/services/base';
import { IHttpClient } from '@/services/httpClient';
import { ITeamsMetadataService } from './teams.types';

const apiUrlSuffix = 'team';
const controller = 'teams/metadata';

export class TeamsMetadataService extends DomainBaseService<ITeamMetadata, uuid> implements ITeamsMetadataService {
  constructor(http: IHttpClient) {
    super(http, apiUrlSuffix, controller);
  }
}
