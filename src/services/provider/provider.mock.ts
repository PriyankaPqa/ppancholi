import { mockPublicService } from '@crctech/registration-lib/src/services/public';
import { mockHouseholdsService } from '@crctech/registration-lib/src/services/households';
import { IProviderMock } from './provider.types';
import { mockEventsService } from '../events';
import { mockCaseFilesService } from '../case-files';
import { mockOptionItemsServiceService } from '../optionItems';
import { mockTeamsService } from '../teams';
import { mockAppUsersService } from '../app-users';
import { mockProgramsService } from '../programs';
import { mockUserAccountsService } from '../user-accounts/entity';

export const mockProvider = (): IProviderMock => ({
  appUsers: mockAppUsersService(),
  caseFiles: mockCaseFilesService(),
  events: mockEventsService(),
  optionItems: mockOptionItemsServiceService(),
  teams: mockTeamsService(),
  programs: mockProgramsService(),
  publicApi: mockPublicService(),
  households: mockHouseholdsService(),
  userAccounts: mockUserAccountsService(),
});
