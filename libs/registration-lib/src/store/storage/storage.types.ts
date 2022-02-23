import { IStorage as IRegistrationStorage, IStorageMock as IRegistrationMock } from './registration';
import { IStorageMake as IHouseholdStorageMake, IStorageMakeMock as IHouseholdStorageMakeMock } from './household';
import { IStorageMake as ITenantSettingsStorageMake, IStorageMakeMock as ITenantSettingsStorageMakeMock } from './tenantSettings';

export interface IStorage {
  registration: IRegistrationStorage;
  household: IHouseholdStorageMake;
  tenantSettings: ITenantSettingsStorageMake;
  // eslint-disable-next-line
  user?: any;
}

export interface IStorageMock {
  registration: IRegistrationMock;
  household: IHouseholdStorageMakeMock;
  tenantSettings: ITenantSettingsStorageMakeMock;
  // eslint-disable-next-line
  user?: any;
}
