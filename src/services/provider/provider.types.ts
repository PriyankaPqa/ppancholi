import { IEventsService, IEventsServiceMock } from '../events';
import { IEventTypesService, IEventTypesServiceMock } from '../eventTypes';
import { ITeamsService, ITeamsServiceMock } from '../teams';

export interface IProvider {
  events: IEventsService;
  eventTypes: IEventTypesService;
  teams: ITeamsService,
}

export interface IProviderMock {
  events: IEventsServiceMock;
  eventTypes: IEventTypesServiceMock;
  teams: ITeamsServiceMock,
}
