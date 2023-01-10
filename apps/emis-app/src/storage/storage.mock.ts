import { mockStorageRegistration } from '@libs/registration-lib/store/storage/registration';
import { HouseholdStorageMock } from '@libs/registration-lib/store/storage/household';
import { UserAccountStorageMock } from '@/storage/user-account/storage.mock';
import { CaseFileStorageMock } from '@/storage/case-file/storage.mock';
import { CaseNoteStorageMock } from '@/storage/case-note/storage.mock';
import { TeamStorageMock } from '@/storage/team/storage.mock';
import { MassActionStorageMock } from '@/storage/mass-action';
import { ApprovalTableStorageMock } from '@/storage/approval-table';
import { IStorageMock } from './storage.types';
import { mockStorageOptionList } from './optionList';
import { FinancialAssistanceStorageMock } from './financial-assistance/storage.mock';
import { FinancialAssistanceCategoryStorageMock } from './financial-assistance-category/storage.mock';
import { FinancialAssistancePaymentStorageMock } from './financial-assistance-payment';
import { TenantSettingsStorageMock } from './tenantSettings';
import { AssessmentTemplateStorageMock } from './assessment-template';
import { AssessmentFormStorageMock } from './assessment-form';
import { AssessmentResponseStorageMock } from './assessment-response';

export const mockStorage = (): IStorageMock => ({
  caseFile: new CaseFileStorageMock().make(),
  caseNote: new CaseNoteStorageMock().make(),
  optionList: mockStorageOptionList(),
  team: new TeamStorageMock().make(),
  registration: mockStorageRegistration(),
  financialAssistance: new FinancialAssistanceStorageMock().make(),
  financialAssistancePayment: new FinancialAssistancePaymentStorageMock().make(),
  financialAssistanceCategory: new FinancialAssistanceCategoryStorageMock().make(),
  household: new HouseholdStorageMock().make(),
  userAccount: new UserAccountStorageMock().make(),
  massAction: new MassActionStorageMock().make(),
  tenantSettings: new TenantSettingsStorageMock().make(),
  assessmentTemplate: new AssessmentTemplateStorageMock().make(),
  approvalTable: new ApprovalTableStorageMock().make(),
  assessmentForm: new AssessmentFormStorageMock().make(),
  assessmentResponse: new AssessmentResponseStorageMock().make(),
});
