import { mockStorageRegistration } from '@crctech/registration-lib/src/store/storage/registration';
import { HouseholdStorageMock } from '@crctech/registration-lib/src/store/storage/household';
import { UserAccountStorageMock } from '@/store/storage/user-account/storage.mock';
import { CaseFileStorageMock } from '@/store/storage/case-file/storage.mock';
import { CaseNoteStorageMock } from '@/store/storage/case-note/storage.mock';
import { MassActionStorageMock } from '@/store/storage/mass-action';
import { IStorageMock } from './storage.types';
import { mockStorageUser } from './user';
import { mockStorageDashboard } from './dashboard';
import { EventStorageMock } from './event/storage.mock';
import { mockStorageOptionList } from './optionList';
import { mockStorageTeam } from './team';
import { mockStorageProgram } from './program';
import { FinancialAssistanceStorageMock } from './financial-assistance/storage.mock';
import { CaseFileReferralStorageMock } from './case-file-referral';
import { CaseFileDocumentStorageMock } from './case-file-document';

export const mockStorage = (): IStorageMock => ({
  caseFile: new CaseFileStorageMock().make(),
  caseNote: new CaseNoteStorageMock().make(),
  caseFileReferral: new CaseFileReferralStorageMock().make(),
  caseFileDocument: new CaseFileDocumentStorageMock().make(),
  dashboard: mockStorageDashboard(),
  user: mockStorageUser(),
  event: new EventStorageMock().make(),
  optionList: mockStorageOptionList(),
  team: mockStorageTeam(),
  program: mockStorageProgram(),
  registration: mockStorageRegistration(),
  financialAssistance: new FinancialAssistanceStorageMock().make(),
  household: new HouseholdStorageMock().make(),
  userAccount: new UserAccountStorageMock().make(),
  massAction: new MassActionStorageMock().make(),
});
