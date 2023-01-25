import { HouseholdStorageMock } from '@libs/registration-lib/store/storage/household';
import { IStorageMock } from './storage.types';

export const mockStorage = (): IStorageMock => ({
  household: new HouseholdStorageMock().make(),
});
