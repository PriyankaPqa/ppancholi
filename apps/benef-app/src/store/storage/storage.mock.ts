import { mockStorageRegistration } from '@libs/registration-lib/store/storage/registration';
import { HouseholdStorageMock } from '@libs/registration-lib/store/storage/household';
import { TenantSettingsStorageMock } from '@libs/registration-lib/store/storage/tenantSettings';
import { IStorageMock } from './storage.types';

export const mockStorage = (): IStorageMock => ({
  registration: mockStorageRegistration(),
  household: new HouseholdStorageMock().make(),
  tenantSettings: new TenantSettingsStorageMock().make(),
});
