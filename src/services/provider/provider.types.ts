import { IHouseholdsService, IHouseholdsServiceMock } from '@crctech/registration-lib/src/services/households/entity';
import {
  IPublicService,
  IPublicServiceMock,
} from '@crctech/registration-lib/src/services/public';
import { ICaseFilesService, ICaseFilesServiceMock } from '../case-files/entity';
import { IOptionItemsService, IOptionItemsServiceMock } from '../optionItems';
import { ITeamsService, ITeamsServiceMock } from '../teams';
import { IAppUsersService, IAppUsersServiceMock } from '../app-users';
import { IProgramsService, IProgramsServiceMock } from '../programs';
import { IUserAccountsServiceMock, UserAccountsService } from '../user-accounts/entity';
import { IEventsService, IEventsServiceMock } from '../events/entity';
import { ICaseNotesService, ICaseNotesServiceMock } from '../case-notes/entity';
import { ICaseFileReferralsService, ICaseFileReferralsServiceMock } from '../case-file-referrals/entity';
import { IFinancialAssistanceTablesService, IFinancialAssistanceTablesServiceMock } from '../financial-assistance-tables/entity';

export interface IProvider {
  appUsers: IAppUsersService,
  caseFiles: ICaseFilesService,
  caseFileNotes: ICaseNotesService,
  caseFileReferrals: ICaseFileReferralsService
  events: IEventsService;
  optionItems: IOptionItemsService;
  teams: ITeamsService,
  programs: IProgramsService,
  publicApi: IPublicService,
  households: IHouseholdsService,
  financialAssistanceTables: IFinancialAssistanceTablesService,
  userAccounts: UserAccountsService,
}

export interface IProviderMock {
  appUsers: IAppUsersServiceMock,
  caseFiles: ICaseFilesServiceMock,
  caseFileNotes: ICaseNotesServiceMock,
  caseFileReferrals: ICaseFileReferralsServiceMock,
  events: IEventsServiceMock;
  optionItems: IOptionItemsServiceMock;
  teams: ITeamsServiceMock,
  programs: IProgramsServiceMock,
  publicApi: IPublicServiceMock,
  households: IHouseholdsServiceMock,
  financialAssistanceTables: IFinancialAssistanceTablesServiceMock,
  userAccounts: IUserAccountsServiceMock,
}
