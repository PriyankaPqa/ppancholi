import { CaseFileStorageMock } from '@/storage/case-file/storage.mock';
import { IStorageMock } from './storage.types';
import { FinancialAssistanceStorageMock } from './financial-assistance/storage.mock';

export const mockStorage = (): IStorageMock => ({
  caseFile: new CaseFileStorageMock().make(),
  financialAssistance: new FinancialAssistanceStorageMock().make(),
});
