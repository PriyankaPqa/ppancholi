import { IHouseholdsService, IHouseholdsServiceMock } from '@crctech/registration-lib/src/services/households';
import {
  IPublicService,
  IPublicServiceMock,
} from '@crctech/registration-lib/src/services/public';
import { IUsersService, IUsersServiceMock } from '../users';
import { ICaseFilesService, ICaseFilesServiceMock } from '../case-files';
import { IEventsService, IEventsServiceMock } from '../events';
import { IOptionItemsService, IOptionItemsServiceMock } from '../optionItems';
import { ITeamsService, ITeamsServiceMock } from '../teams';
import { IAppUsersService, IAppUsersServiceMock } from '../app-users';
import { IUserAccountsService, IUserAccountsServiceMock } from '../user-accounts';
import { IProgramsService, IProgramsServiceMock } from '../programs';

export interface IProvider {
  appUsers: IAppUsersService,
  caseFiles: ICaseFilesService,
  events: IEventsService;
  optionItems: IOptionItemsService;
  teams: ITeamsService,
  users: IUsersService,
  userAccounts: IUserAccountsService,
  programs: IProgramsService,
  publicApi: IPublicService,
  households: IHouseholdsService,
}

export interface IProviderMock {
  appUsers: IAppUsersServiceMock,
  caseFiles: ICaseFilesServiceMock,
  events: IEventsServiceMock;
  optionItems: IOptionItemsServiceMock;
  teams: ITeamsServiceMock,
  users: IUsersServiceMock,
  userAccounts: IUserAccountsServiceMock,
  programs: IProgramsServiceMock,
  publicApi: IPublicServiceMock,
  households: IHouseholdsServiceMock,
}
