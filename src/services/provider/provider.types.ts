import { IUsersService, IUsersServiceMock } from '../users';
import { IEventsService, IEventsServiceMock } from '../events';
import { IOptionItemsService, IOptionItemsServiceMock } from '../optionItems';
import { ITeamsService, ITeamsServiceMock } from '../teams';
import { IAppUsersService, IAppUsersServiceMock } from '../app-users';

export interface IProvider {
  appUsers: IAppUsersService,
  events: IEventsService;
  optionItems: IOptionItemsService;
  teams: ITeamsService,
  users: IUsersService
}

export interface IProviderMock {
  appUsers: IAppUsersServiceMock,
  events: IEventsServiceMock;
  optionItems: IOptionItemsServiceMock;
  teams: ITeamsServiceMock,
  users: IUsersServiceMock,
}
