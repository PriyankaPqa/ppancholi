import { IProgramEntity } from '@libs/entities-lib/program';
import { IAzureCombinedSearchResult, IAzureSearchParams } from '@libs/shared-lib/types';
import { IEntity } from '@libs/entities-lib/base';
import { GlobalHandler, IHttpClient } from '../../http-client';
import { DomainBaseService } from '../../base';
import { IProgramsService } from './programs.types';

const API_URL_SUFFIX = 'event/events/{eventId}';
const ENTITY = 'programs';
interface UrlParams {
  id: uuid;
  eventId: uuid;
}

export class ProgramsService extends DomainBaseService<IProgramEntity, UrlParams> implements IProgramsService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, ENTITY);
  }

  async createProgram(program: IProgramEntity): Promise<IProgramEntity> {
    program.fillEmptyMultilingualAttributes();
    return this.http.post(this.getItemUrl(`${this.baseUrl}`, program), program, { globalHandler: GlobalHandler.Partial });
  }

  async updateProgram(program: IProgramEntity): Promise<IProgramEntity> {
    program.fillEmptyMultilingualAttributes();

    return this.http.patch(this.getItemUrl(`${this.baseUrl}/{id}`, program), program, { globalHandler: GlobalHandler.Partial });
  }

  async search(params: IAzureSearchParams):
    Promise<IAzureCombinedSearchResult<IProgramEntity, IEntity>> {
    return this.http.get('event/search/programsV2', { params, isOData: true });
  }
}
