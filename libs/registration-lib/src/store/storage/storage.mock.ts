import { HouseholdStorageMock } from './household';
import { IStorageMock } from './storage.types';

export const mockStorage = (): IStorageMock => ({
  household: new HouseholdStorageMock().make(),
});
