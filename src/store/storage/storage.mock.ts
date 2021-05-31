import { mockStorageRegistration } from '@crctech/registration-lib/src/store/storage/registration';
import { mockStorageHousehold } from '@crctech/registration-lib/src/store/storage/household';
import { IStorageMock } from './storage.types';

export const mockStorage = (): IStorageMock => ({
  registration: mockStorageRegistration(),
  household: mockStorageHousehold(),
});
