import { mockStorageRegistration } from './registration';
import { mockStorageHousehold } from './household';
import { IStorageMock } from './storage.types';

export const mockStorage = (): IStorageMock => ({
  registration: mockStorageRegistration(),
  household: mockStorageHousehold(),
});
