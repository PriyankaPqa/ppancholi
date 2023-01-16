import { EEventStatus, IEventEntity } from '@libs/entities-lib/event';
import { IAzureCombinedSearchResult, ICombinedIndex } from '@libs/shared-lib/types';
import { IHttpClient } from '@libs/services-lib/src/http-client';

export class CypressEventsService {
  constructor(protected readonly http: IHttpClient) {}

  async fetchOneOpenEvent(): Promise<ICombinedIndex<IEventEntity, unknown> & { id: string, tenantId: string }> {
    const params = {
      orderBy: 'Entity/Schedule/OpenDate desc',
      filter: {
        Entity: {
          Schedule: {
            Status: EEventStatus.Open,
          },
        },
      },
      select: ['Entity/Id'],
      top: 1,
      queryType: 'full',
      searchMode: 'all',
    };

    const response = await this.http.get('event/search/events', { params, isOData: true }) as IAzureCombinedSearchResult<IEventEntity, unknown>;
    return response.value[0];
  }
}
