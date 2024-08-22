import { EEventStatus, IEventEntity } from '@libs/entities-lib/event';
import { ICombinedSearchResult, ICombinedIndex } from '@libs/shared-lib/types';
import { IHttpClient } from '@libs/services-lib/http-client';

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
    };

    const response = await this.http.get('event/search/events', { params, isOData: true }) as ICombinedSearchResult<IEventEntity, unknown>;
    return response.value[0];
  }
}
