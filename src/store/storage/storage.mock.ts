import { HouseholdStorageMock } from '../storage/household';
import { mockStorageRegistration } from './registration';
import { IStorageMock } from './storage.types';

export const mockStorage = (): IStorageMock => ({
  registration: mockStorageRegistration(),
  household: new HouseholdStorageMock().make(),
});
