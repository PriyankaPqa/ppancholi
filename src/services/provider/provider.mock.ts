import { IProviderMock } from './provider.types';
import { mockEventsService } from '../events';
import { mockOptionItemsServiceService } from '../optionItems';
import { mockTeamsService } from '../teams';
import { mockAppUsersService } from '../app-users';

export const mockProvider = (): IProviderMock => ({
  appUsers: mockAppUsersService(),
  events: mockEventsService(),
  optionItems: mockOptionItemsServiceService(),
  teams: mockTeamsService(),
});
