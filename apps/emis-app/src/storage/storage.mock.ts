import { IStorageMock } from './storage.types';
import { FinancialAssistanceStorageMock } from './financial-assistance/storage.mock';

export const mockStorage = (): IStorageMock => ({
  financialAssistance: new FinancialAssistanceStorageMock().make(),
});
