import { httpClient } from '@/services/httpClient';
import { PublicService } from '@crctech/registration-lib/src/services/public';
import { HouseholdsService } from '@crctech/registration-lib/src/services/households/entity';
import { IProvider } from './provider.types';
import { CaseFilesService } from '../case-files';
import { EventsService } from '../events';
import { OptionItemsService } from '../optionItems';
import { TeamsService } from '../teams';
import { AppUsersService } from '../app-users';
import { UserAccountsService } from '../user-accounts/entity';
import { ProgramsService } from '../programs';
import { FinancialAssistanceTablesService } from '../financial-assistance-tables';

export const provider = (): IProvider => ({
  appUsers: new AppUsersService(httpClient),
  caseFiles: new CaseFilesService(httpClient),
  events: new EventsService(httpClient),
  optionItems: new OptionItemsService(httpClient),
  teams: new TeamsService(httpClient),
  programs: new ProgramsService(httpClient),
  publicApi: new PublicService(httpClient),
  households: new HouseholdsService(httpClient),
  financialAssistanceTables: new FinancialAssistanceTablesService(httpClient),
  userAccounts: new UserAccountsService(httpClient),
});
