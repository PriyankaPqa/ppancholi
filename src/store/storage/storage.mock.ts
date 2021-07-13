import { mockStorageRegistration } from '@crctech/registration-lib/src/store/storage/registration';
import { HouseholdStorageMock } from '@crctech/registration-lib/src/store/storage/household';
import { UserAccountStorageMock } from '@/store/storage/user-account/storage.mock';
import { CaseFileStorageMock } from '@/store/storage/case-file/storage.mock';
import { CaseNoteStorageMock } from '@/store/storage/case-note/storage.mock';
import { IStorageMock } from './storage.types';
import { mockStorageUser } from './user';
import { mockStorageDashboard } from './dashboard';
import { mockStorageEvent } from './event';
import { mockStorageOptionList } from './optionList';
import { mockStorageTeam } from './team';
import { mockStorageProgram } from './program';
import { mockStorageFinancialAssistance } from './financial-assistance/storage.mock';
import { CaseFileReferralStorageMock } from './case-file-referral';

export const mockStorage = (): IStorageMock => ({
  caseFile: new CaseFileStorageMock().make(),
  caseNote: new CaseNoteStorageMock().make(),
  caseFileReferral: new CaseFileReferralStorageMock().make(),
  dashboard: mockStorageDashboard(),
  user: mockStorageUser(),
  event: mockStorageEvent(),
  optionList: mockStorageOptionList(),
  team: mockStorageTeam(),
  program: mockStorageProgram(),
  registration: mockStorageRegistration(),
  financialAssistance: mockStorageFinancialAssistance(),
  household: new HouseholdStorageMock().make(),
  userAccount: new UserAccountStorageMock().make(),
});
