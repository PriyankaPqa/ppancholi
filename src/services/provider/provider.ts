import { PublicService } from '@crctech/registration-lib/src/services/public';
import { HouseholdsService } from '@crctech/registration-lib/src/services/households/entity';
import { httpClient } from '@/services/httpClient';
import { IProvider } from './provider.types';
import { CaseFilesService } from '../case-files/entity';
import { AppUsersService } from '../app-users';
import { OptionItemsService } from '../optionItems';
import { TeamsService } from '../teams/entity';
import { ProgramsService } from '../programs';
import { FinancialAssistanceTablesService } from '../financial-assistance-tables/entity';
import { UserAccountsService } from '../user-accounts/entity';
import { EventsService } from '../events/entity';
import { CaseFileReferralsService } from '../case-file-referrals/entity';
import { CaseFileDocumentsService } from '../case-file-documents/entity';
import { CaseNotesService } from '../case-notes/entity';

export const provider = (): IProvider => ({
  appUsers: new AppUsersService(httpClient),
  caseFiles: new CaseFilesService(httpClient),
  caseFileNotes: new CaseNotesService(httpClient),
  caseFileReferrals: new CaseFileReferralsService(httpClient),
  caseFileDocuments: new CaseFileDocumentsService(httpClient),
  events: new EventsService(httpClient),
  optionItems: new OptionItemsService(httpClient),
  teams: new TeamsService(httpClient),
  programs: new ProgramsService(httpClient),
  publicApi: new PublicService(httpClient),
  households: new HouseholdsService(httpClient),
  financialAssistanceTables: new FinancialAssistanceTablesService(httpClient),
  userAccounts: new UserAccountsService(httpClient),
});
