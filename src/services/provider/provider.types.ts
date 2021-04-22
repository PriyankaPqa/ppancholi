import { IUsersService, IUsersServiceMock } from '../users';
import { ICaseFilesService, ICaseFilesServiceMock } from '../case-files';
import { IEventsService, IEventsServiceMock } from '../events';
import { IOptionItemsService, IOptionItemsServiceMock } from '../optionItems';
import { ITeamsService, ITeamsServiceMock } from '../teams';
import { IAppUsersService, IAppUsersServiceMock } from '../app-users';
import { IProgramsService, IProgramsServiceMock } from '../programs';

export interface IProvider {
  appUsers: IAppUsersService,
  caseFiles: ICaseFilesService,
  events: IEventsService;
  optionItems: IOptionItemsService;
  teams: ITeamsService,
  users: IUsersService,
  programs: IProgramsService,
}

export interface IProviderMock {
  appUsers: IAppUsersServiceMock,
  caseFiles: ICaseFilesServiceMock,
  events: IEventsServiceMock;
  optionItems: IOptionItemsServiceMock;
  teams: ITeamsServiceMock,
  users: IUsersServiceMock,
  programs: IProgramsServiceMock,
}
