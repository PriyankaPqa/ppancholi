import { httpClient } from '@/services/httpClient';
import { EventsService as RegistrationEventsService } from '@crctech/registration-lib/src/services/events';
import { BeneficiariesService } from '@crctech/registration-lib/src/services/beneficiaries';
import { IProvider } from './provider.types';
import { CaseFilesService } from '../case-files';
import { EventsService } from '../events';
import { OptionItemsService } from '../optionItems';
import { TeamsService } from '../teams';
import { AppUsersService } from '../app-users';
import { UsersService } from '../users';
import { ProgramsService } from '../programs';

export const provider = (): IProvider => ({
  appUsers: new AppUsersService(httpClient),
  caseFiles: new CaseFilesService(httpClient),
  events: new EventsService(httpClient),
  optionItems: new OptionItemsService(httpClient),
  teams: new TeamsService(httpClient),
  users: new UsersService(httpClient),
  programs: new ProgramsService(httpClient),
  registrationEvents: new RegistrationEventsService(httpClient),
  beneficiaries: new BeneficiariesService(httpClient),
});
