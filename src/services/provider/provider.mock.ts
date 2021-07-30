import { mockPublicService } from '@crctech/registration-lib/src/services/public';
import { mockHouseholdsService } from '@crctech/registration-lib/src/services/households/entity';
import { IProviderMock } from './provider.types';
import { mockAppUsersService } from '../app-users';
import { mockCaseFilesService } from '../case-files/entity';
import { mockOptionItemsServiceService } from '../optionItems';
import { mockTeamsService } from '../teams';
import { mockProgramsService } from '../programs';
import { mockFinancialAssistanceTablesService } from '../financial-assistance-tables/entity';
import { mockUserAccountsService } from '../user-accounts/entity';
import { mockEventsService } from '../events/entity';
import { mockCaseNotesService } from '../case-notes/entity';
import { mockCaseFileReferralsService } from '../case-file-referrals/entity';
import { mockCaseFileDocumentsService } from '../case-file-documents/entity';

export const mockProvider = (): IProviderMock => ({
  appUsers: mockAppUsersService(),
  caseFiles: mockCaseFilesService(),
  caseFileNotes: mockCaseNotesService(),
  caseFileReferrals: mockCaseFileReferralsService(),
  caseFileDocuments: mockCaseFileDocumentsService(),
  optionItems: mockOptionItemsServiceService(),
  teams: mockTeamsService(),
  programs: mockProgramsService(),
  publicApi: mockPublicService(),
  households: mockHouseholdsService(),
  financialAssistanceTables: mockFinancialAssistanceTablesService(),
  userAccounts: mockUserAccountsService(),
  events: mockEventsService(),
});
