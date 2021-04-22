import { mockStorageRegistration } from '@crctech/registration-lib/src/store/storage/registration';
import { mockStorageBeneficiary } from '@crctech/registration-lib/src/store/storage/beneficiary';
import { IStorageMock } from './storage.types';

export const mockStorage = (): IStorageMock => ({
  registration: mockStorageRegistration(),
  beneficiary: mockStorageBeneficiary(),
});
