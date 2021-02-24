import { IEventsService, IEventsServiceMock } from '../events';
import { ITeamsService, ITeamsServiceMock } from '../teams';

export interface IProvider {
  events: IEventsService,
  teams: ITeamsService,
}

export interface IProviderMock {
  events: IEventsServiceMock,
  teams: ITeamsServiceMock,
}
