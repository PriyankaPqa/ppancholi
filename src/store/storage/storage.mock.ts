import { IStorageMock } from './storage.types';
import { mockStorageUser } from './user';
import { mockStorageDashboard } from './dashboard';
import { mockStorageEvent } from './event';
import { mockStorageOptionList } from './optionList';
import { mockStorageTeam } from './team';

export const mockStorage = (): IStorageMock => ({
  dashboard: mockStorageDashboard(),
  user: mockStorageUser(),
  event: mockStorageEvent(),
  optionList: mockStorageOptionList(),
  team: mockStorageTeam(),
});
