import { IStorageMock } from './storage.types';
import { mockStorageUser } from './user';
import { mockStorageCaseFile } from './case-file';
import { mockStorageDashboard } from './dashboard';
import { mockStorageEvent } from './event';
import { mockStorageOptionList } from './optionList';
import { mockStorageTeam } from './team';
import { mockStorageAppUser } from './app-user';
import { mockStorageProgram } from './program';

export const mockStorage = (): IStorageMock => ({
  appUser: mockStorageAppUser(),
  caseFile: mockStorageCaseFile(),
  dashboard: mockStorageDashboard(),
  user: mockStorageUser(),
  event: mockStorageEvent(),
  optionList: mockStorageOptionList(),
  team: mockStorageTeam(),
  program: mockStorageProgram(),
});
