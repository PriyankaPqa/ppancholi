import { mockStorageRegistration } from './registration';
import { mockStorageBeneficiary } from './beneficiary';
import { IStorageMock } from './storage.types';

export const mockStorage = (): IStorageMock => ({
  registration: mockStorageRegistration(),
  beneficiary: mockStorageBeneficiary(),
});
