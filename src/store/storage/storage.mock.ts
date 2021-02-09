import { IStorageMock } from './storage.types';
import { mockStorageRegistration } from './registration';

export const mockStorage = (): IStorageMock => ({
  registration: mockStorageRegistration(),
});
