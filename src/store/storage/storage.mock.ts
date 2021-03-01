import { IStorageMock } from './storage.types';
import { mockStorageUser } from './user';
import { mockStorageDashboard } from './dashboard';
import { mockStorageEvent } from './event';
import { mockStorageOptionList } from './optionList';
import { mockStorageTeam } from './team';
import { mockStorageAppUser } from './app-user';

export const mockStorage = (): IStorageMock => ({
  appUser: mockStorageAppUser(),
  dashboard: mockStorageDashboard(),
  user: mockStorageUser(),
  event: mockStorageEvent(),
  optionList: mockStorageOptionList(),
  team: mockStorageTeam(),
});
