import { IHouseholdsService, IHouseholdsServiceMock } from '@crctech/registration-lib/src/services/households';
import {
  IPublicService,
  IPublicServiceMock,
} from '@crctech/registration-lib/src/services/public';
import { IUserAccountsServiceMock, UserAccountsService } from '../user-accounts/entity';
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
  programs: IProgramsService,
  publicApi: IPublicService,
  households: IHouseholdsService,
  userAccounts: UserAccountsService,
}

export interface IProviderMock {
  appUsers: IAppUsersServiceMock,
  caseFiles: ICaseFilesServiceMock,
  events: IEventsServiceMock;
  optionItems: IOptionItemsServiceMock;
  teams: ITeamsServiceMock,
  programs: IProgramsServiceMock,
  publicApi: IPublicServiceMock,
  households: IHouseholdsServiceMock,
  userAccounts: IUserAccountsServiceMock,
}
