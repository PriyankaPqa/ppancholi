import { mockPublicService } from '@crctech/registration-lib/src/services/public';
import { mockHouseholdsService } from '@crctech/registration-lib/src/services/households/entity';
import { IProviderMock } from './provider.types';
import { mockAppUsersService } from '../app-users';
import { mockCaseFilesService } from '../case-files/entity';
import { mockOptionItemsServiceService } from '../optionItems';
import { mockTeamsService } from '../teams/entity';
import { mockProgramsService } from '../programs/entity';
import { mockFinancialAssistanceTablesService } from '../financial-assistance-tables/entity';
import { mockUserAccountsService } from '../user-accounts/entity';
import { mockEventsService } from '../events/entity';
import { mockCaseNotesService } from '../case-notes/entity';
import { mockCaseFileReferralsService } from '../case-file-referrals/entity';
import { mockCaseFileDocumentsService } from '../case-file-documents/entity';
import { mockFinancialAssistanceCategoriesService } from '../financial-assistance-categories/entity';
import { mockMassActionService } from '@/services/mass-actions/entity';
import { mockFinancialAssistanceService } from '../financial-assistance-payments/entity';

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
  financialAssistancePaymentsService: mockFinancialAssistanceService(),
  userAccounts: mockUserAccountsService(),
  events: mockEventsService(),
  financialAssistanceCategories: mockFinancialAssistanceCategoriesService(),
  massActions: mockMassActionService(),
});
