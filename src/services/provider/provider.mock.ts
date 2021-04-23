import { mockEventsService as mockRegistrationEventsService } from '@crctech/registration-lib/src/services/events';
import { mockBeneficiariesService } from '@crctech/registration-lib/src/services/beneficiaries';
import { IProviderMock } from './provider.types';
import { mockEventsService } from '../events';
import { mockCaseFilesService } from '../case-files';
import { mockOptionItemsServiceService } from '../optionItems';
import { mockTeamsService } from '../teams';
import { mockAppUsersService } from '../app-users';
import { mockUsersService } from '../users';
import { mockProgramsService } from '../programs';

export const mockProvider = (): IProviderMock => ({
  appUsers: mockAppUsersService(),
  caseFiles: mockCaseFilesService(),
  events: mockEventsService(),
  optionItems: mockOptionItemsServiceService(),
  teams: mockTeamsService(),
  users: mockUsersService(),
  programs: mockProgramsService(),
  registrationEvents: mockRegistrationEventsService(),
  beneficiaries: mockBeneficiariesService(),
});
