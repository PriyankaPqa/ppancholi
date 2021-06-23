import { mockStorageRegistration } from '@crctech/registration-lib/src/store/storage/registration';
import { HouseholdStorageMock } from '@crctech/registration-lib/src/store/storage/household';
import { UserAccountStorageMock } from '@/store/storage/user-account/storage.mock';
import { IStorageMock } from './storage.types';
import { mockStorageUser } from './user';
import { mockStorageCaseFile } from './case-file';
import { mockStorageDashboard } from './dashboard';
import { mockStorageEvent } from './event';
import { mockStorageOptionList } from './optionList';
import { mockStorageTeam } from './team';
import { mockStorageProgram } from './program';

export const mockStorage = (): IStorageMock => ({
  caseFile: mockStorageCaseFile(),
  dashboard: mockStorageDashboard(),
  user: mockStorageUser(),
  event: mockStorageEvent(),
  optionList: mockStorageOptionList(),
  team: mockStorageTeam(),
  program: mockStorageProgram(),
  registration: mockStorageRegistration(),
  household: new HouseholdStorageMock().make(),
  userAccount: new UserAccountStorageMock().make(),
});
