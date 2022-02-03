import { mockStorageRegistration } from '@crctech/registration-lib/src/store/storage/registration';
import { HouseholdStorageMock } from '@crctech/registration-lib/src/store/storage/household';
import { TenantSettingsStorageMock } from '@crctech/registration-lib/src/store/storage/tenantSettings';
import { IStorageMock } from './storage.types';

export const mockStorage = (): IStorageMock => ({
  registration: mockStorageRegistration(),
  household: new HouseholdStorageMock().make(),
  tenantSettings: new TenantSettingsStorageMock().make(),
});
