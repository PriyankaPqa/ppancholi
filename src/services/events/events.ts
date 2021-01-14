import { IHttpClient } from '@/services';
import ServicesUtil from '@/services/services-util';
import { IEventTypeData } from '@/entities/eventType';
import { IRestResponse } from '@/types';
import { IEventsService } from './events.types';

export class EventsService implements IEventsService {
  constructor(private readonly http: IHttpClient) {}

  async getEventTypes(): Promise<IRestResponse<IEventTypeData[]>> {
    try {
      const res = await this.http.get('/event/event-types');
      return ServicesUtil.responseBuilder(res as IRestResponse<IEventTypeData[]>);
    } catch (error) {
      return ServicesUtil.createErrorObject(error);
    }
  }
}
