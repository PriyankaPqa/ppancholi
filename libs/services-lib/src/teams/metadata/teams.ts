import { ITeamMetadata } from '@libs/entities-lib/team';
import { IHttpClient } from '../../http-client';
import { DomainBaseService } from '../../base';
import { ITeamsMetadataService } from './teams.types';

const apiUrlSuffix = 'team';
const controller = 'teams/metadata';

export class TeamsMetadataService extends DomainBaseService<ITeamMetadata, uuid> implements ITeamsMetadataService {
  constructor(http: IHttpClient) {
    super(http, apiUrlSuffix, controller);
  }
}
