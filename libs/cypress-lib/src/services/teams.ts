import { ICombinedIndex } from '@libs/shared-lib/types';
import { IHttpClient } from '@libs/services-lib/src/http-client';
import { ITeamEntity } from '@libs/entities-lib/src/team';

export class CypressTeamsService {
  constructor(protected readonly http: IHttpClient) {}

  async removeAllTeamMembers(teamId:string): Promise<ICombinedIndex<ITeamEntity, unknown>> {
    const response = await this.http.delete(`team/teams/${teamId}/remove-all-members`) as ICombinedIndex<ITeamEntity, unknown>;
    return response;
  }
}
