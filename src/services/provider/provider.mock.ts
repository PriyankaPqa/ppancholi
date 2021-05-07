import { mockPublicService } from '@crctech/registration-lib/src/services/public';
import { mockBeneficiariesService } from '@crctech/registration-lib/src/services/beneficiaries';
import { IProviderMock } from './provider.types';
import { mockEventsService } from '../events';
import { mockCaseFilesService } from '../case-files';
import { mockOptionItemsServiceService } from '../optionItems';
import { mockTeamsService } from '../teams';
import { mockAppUsersService } from '../app-users';
import { mockUsersService } from '../users';
import { mockUserAccountsService } from '../user-accounts';
import { mockProgramsService } from '../programs';

export const mockProvider = (): IProviderMock => ({
  appUsers: mockAppUsersService(),
  caseFiles: mockCaseFilesService(),
  events: mockEventsService(),
  optionItems: mockOptionItemsServiceService(),
  teams: mockTeamsService(),
  users: mockUsersService(),
  userAccounts: mockUserAccountsService(),
  programs: mockProgramsService(),
  publicApi: mockPublicService(),
  beneficiaries: mockBeneficiariesService(),
});
