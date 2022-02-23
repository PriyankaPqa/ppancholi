import { IStorage as IRegistrationStorage, IStorageMock as IRegistrationMock } from '@libs/registration-lib/store/storage/registration';
import { IStorageMake, IStorageMakeMock } from '@libs/registration-lib/store/storage/household';
import {
  IStorageMake as ITenantSettingsMakeStorage,
  IStorageMakeMock as ITenantSettingsMakeStorageMock,
} from '@libs/registration-lib/store/storage/tenantSettings';

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
