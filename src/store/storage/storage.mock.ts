import { IStorageMock } from './storage.types';
import { mockStorageUser } from './user';
import { mockStorageDashboard } from './dashboard';

export const mockStorage = (): IStorageMock => ({
  dashboard: mockStorageDashboard(),
  user: mockStorageUser(),
});
