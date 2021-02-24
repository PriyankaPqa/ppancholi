import { IHttpClient } from '@/services/httpClient';
import { IEventTypeData } from '@/entities/eventType';
import { EOptionListItemStatus, IMultilingual } from '@/types';
import { IEventTypesService } from './eventTypes.types';

export class EventTypesService implements IEventTypesService {
  constructor(private readonly http: IHttpClient) {}

  async getEventTypes(): Promise<IEventTypeData[]> {
    return this.http.get('/event/event-types');
  }

  async createEventType(eventType: IEventTypeData): Promise<IEventTypeData> {
    return this.http.post('/event/event-types', eventType);
  }

  async updateEventTypeName(id: string, name: IMultilingual): Promise<IEventTypeData> {
    return this.http.patch(`/event/event-types/${id}/name`, {
      name,
    });
  }

  async updateEventTypeStatus(id: string, itemStatus: EOptionListItemStatus): Promise<IEventTypeData> {
    return this.http.patch(`/event/event-types/${id}/item-status`, {
      itemStatus,
    });
  }

  async updateEventTypeOrderRanks(reOrders: Record<string, number>): Promise<IEventTypeData[]> {
    return this.http.patch('/event/event-types/order-ranks', {
      reOrders,
    });
  }

  async setEventTypeIsOther(id: string, isOther: boolean): Promise<IEventTypeData> {
    return this.http.patch(`/event/event-types/${id}/is-other`, {
      isOther,
    });
  }

  async setEventTypeIsDefault(id: string, isDefault: boolean): Promise<IEventTypeData> {
    return this.http.patch(`/event/event-types/${id}/is-default`, {
      isDefault,
    });
  }
}
