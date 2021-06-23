import { HouseholdStorageMock } from '@/store/storage/household';
import { mockStorageRegistration } from './registration';
import { IStorageMock } from './storage.types';

export const mockStorage = (): IStorageMock => ({
  registration: mockStorageRegistration(),
  household: new HouseholdStorageMock().make(),
});
