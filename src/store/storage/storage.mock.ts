import { IStorageMock } from './storage.types';
import { mockStorageRegistration } from './registration';
import { mockStorageBeneficiary } from './beneficiary';

export const mockStorage = (): IStorageMock => ({
  registration: mockStorageRegistration(),
  beneficiary: mockStorageBeneficiary(),
});
