import { IStorage as IRegistrationStorage, IStorageMock as IRegistrationMock } from '@crctech/registration-lib/src/store/storage/registration';
import { IStorage as IHouseholdStorage, IStorageMock as IHouseholdMock } from '@crctech/registration-lib/src/store/storage/household';
import { IStorage as IUserStorage, IStorageMock as IUserStorageMock } from './user';
import { IStorage as ICaseFileStorage, IStorageMock as ICaseFileStorageMock } from './case-file';
import { IStorage as IDashboardStorage, IStorageMock as IDashboardStorageMock } from './dashboard';
import { IStorage as IEventStorage, IStorageMock as IEventStorageMock } from './event';
import { IStorage as IOptionListStorage, IStorageMock as IOptionListStorageMock } from './optionList';
import { IStorage as ITeamStorage, IStorageMock as ITeamStorageMock } from './team';
import { IStorage as IProgramStorage, IStorageMock as IProgramStorageMock } from './program';
import {
  IStorageMake as IUserAccountMakeStorage,
  IStorageMakeMock as IUserAccountMakeStorageMock,
} from './user-account/storage.types';

export interface IStorage {
  user: IUserStorage;
  caseFile: ICaseFileStorage;
  dashboard: IDashboardStorage;
  event: IEventStorage;
  optionList: IOptionListStorage;
  team: ITeamStorage;
  program: IProgramStorage;
  registration: IRegistrationStorage;
  household: IHouseholdStorage;
  userAccount: IUserAccountMakeStorage;
}

export interface IStorageMock {
  user: IUserStorageMock;
  caseFile: ICaseFileStorageMock;
  dashboard: IDashboardStorageMock;
  event: IEventStorageMock;
  optionList: IOptionListStorageMock;
  team: ITeamStorageMock;
  program: IProgramStorageMock;
  registration: IRegistrationMock;
  household: IHouseholdMock;
  userAccount: IUserAccountMakeStorageMock;
}
