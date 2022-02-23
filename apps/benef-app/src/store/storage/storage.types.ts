import { IStorage as IRegistrationStorage, IStorageMock as IRegistrationMock } from '@crctech/registration-lib/src/store/storage/registration';
import { IStorageMake, IStorageMakeMock } from '@crctech/registration-lib/src/store/storage/household';
import {
  IStorageMake as ITenantSettingsMakeStorage,
  IStorageMakeMock as ITenantSettingsMakeStorageMock,
} from '@crctech/registration-lib/src/store/storage/tenantSettings';

export interface IStorage {
  registration: IRegistrationStorage;
  household: IStorageMake;
  tenantSettings: ITenantSettingsMakeStorage;
}

export interface IStorageMock {
  registration: IRegistrationMock;
  household: IStorageMakeMock;
  tenantSettings: ITenantSettingsMakeStorageMock;
}
