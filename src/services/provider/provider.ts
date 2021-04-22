import { httpClient } from '@/services/httpClient';
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
});
