import { HouseholdStorageMock } from '@libs/registration-lib/store/storage/household';
import { UserAccountStorageMock } from '@/storage/user-account/storage.mock';
import { CaseFileStorageMock } from '@/storage/case-file/storage.mock';
import { TeamStorageMock } from '@/storage/team/storage.mock';
import { IStorageMock } from './storage.types';
import { FinancialAssistanceStorageMock } from './financial-assistance/storage.mock';
import { FinancialAssistanceCategoryStorageMock } from './financial-assistance-category/storage.mock';
import { FinancialAssistancePaymentStorageMock } from './financial-assistance-payment';

export const mockStorage = (): IStorageMock => ({
  caseFile: new CaseFileStorageMock().make(),
  team: new TeamStorageMock().make(),
  financialAssistance: new FinancialAssistanceStorageMock().make(),
  financialAssistancePayment: new FinancialAssistancePaymentStorageMock().make(),
  financialAssistanceCategory: new FinancialAssistanceCategoryStorageMock().make(),
  household: new HouseholdStorageMock().make(),
  userAccount: new UserAccountStorageMock().make(),
});
