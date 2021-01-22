import { IStorageMock } from './storage.types';
import { mockStorageUser } from './user';
import { mockStorageDashboard } from './dashboard';
import { mockStorageEvent } from './event';

export const mockStorage = (): IStorageMock => ({
  dashboard: mockStorageDashboard(),
  user: mockStorageUser(),
  event: mockStorageEvent(),
});
