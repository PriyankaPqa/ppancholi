import { IRestResponse } from '@/types';
import { IEventTypeData } from '@/entities/eventType';

export interface IEventsService {
  getEventTypes(): Promise<IRestResponse<Array<IEventTypeData>>>;
}

export interface IEventsServiceMock {
  getEventTypes: jest.Mock <IEventTypeData[]>;
}
