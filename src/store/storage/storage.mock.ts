import { HouseholdStorageMock } from './household';
import { TenantSettingsStorageMock } from './tenantSettings';
import { mockStorageRegistration } from './registration';
import { IStorageMock } from './storage.types';

export const mockStorage = (): IStorageMock => ({
  registration: mockStorageRegistration(),
  household: new HouseholdStorageMock().make(),
  tenantSettings: new TenantSettingsStorageMock().make(),
});
