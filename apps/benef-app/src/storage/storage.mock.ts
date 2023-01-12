import { mockStorageRegistration } from '@libs/registration-lib/store/storage/registration';
import { HouseholdStorageMock } from '@libs/registration-lib/store/storage/household';
import { IStorageMock } from './storage.types';

export const mockStorage = (): IStorageMock => ({
  registration: mockStorageRegistration(),
  household: new HouseholdStorageMock().make(),
});
