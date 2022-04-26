import { IProgramEntity, IProgramMetadata } from '@/entities/program';
import { DomainBaseService } from '@/services/base';
import { IHttpClient } from '@libs/core-lib/services/http-client';
import { IAzureCombinedSearchResult, IAzureSearchParams } from '@libs/core-lib/types';
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
    return this.http.post(this.getItemUrl(`${this.baseUrl}`, program), program, { globalHandler: false });
  }

  async updateProgram(program: IProgramEntity): Promise<IProgramEntity> {
    program.fillEmptyMultilingualAttributes();

    return this.http.patch(this.getItemUrl(`${this.baseUrl}/{id}`, program), program, { globalHandler: false });
  }

  async search(params: IAzureSearchParams, searchEndpoint: string = null):
    Promise<IAzureCombinedSearchResult<IProgramEntity, IProgramMetadata>> {
    return this.http.get(`event/search/${searchEndpoint ?? 'programs'}`, { params, isOData: true });
  }
}
