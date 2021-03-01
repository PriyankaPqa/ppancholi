import { IEventsService, IEventsServiceMock } from '../events';
import { IEventTypesService, IEventTypesServiceMock } from '../eventTypes';
import { ITeamsService, ITeamsServiceMock } from '../teams';
import { IAppUsersService, IAppUsersServiceMock } from '../app-users';

export interface IProvider {
  events: IEventsService;
  eventTypes: IEventTypesService;
  teams: ITeamsService,
  appUsers: IAppUsersService,
}

export interface IProviderMock {
  events: IEventsServiceMock;
  eventTypes: IEventTypesServiceMock;
  teams: ITeamsServiceMock,
  appUsers: IAppUsersServiceMock,
}
