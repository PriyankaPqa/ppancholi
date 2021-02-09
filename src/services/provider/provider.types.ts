import { IEventsService, IEventsServiceMock } from '../events';

export interface IProvider {
  events: IEventsService
}

export interface IProviderMock {
  events: IEventsServiceMock
}
