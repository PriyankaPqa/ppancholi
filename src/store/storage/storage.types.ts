import { IStorage as IRegistrationStorage, IStorageMock as IRegistrationMock } from '@crctech/registration-lib/src/store/storage/registration';
import { IStorageMake, IStorageMakeMock } from '@crctech/registration-lib/src/store/storage/household';
import { IStorage as IUserStorage, IStorageMock as IUserStorageMock } from './user';
import { IStorage as IDashboardStorage, IStorageMock as IDashboardStorageMock } from './dashboard';
import { IStorage as IEventStorage, IStorageMock as IEventStorageMock } from './event';
import { IStorage as IOptionListStorage, IStorageMock as IOptionListStorageMock } from './optionList';
import { IStorage as ITeamStorage, IStorageMock as ITeamStorageMock } from './team';
import { IStorage as IProgramStorage, IStorageMock as IProgramStorageMock } from './program';
import { IStorage as IFinancialAssistanceStorage, IStorageMock as IFinancialAssistanceStorageMock } from './financial-assistance';
import {
  IStorageMake as IUserAccountMakeStorage,
  IStorageMakeMock as IUserAccountMakeStorageMock,
} from './user-account/storage.types';

import {
  IStorageMake as ICaseFileMakeStorage,
  IStorageMakeMock as ICaseFileMakeStorageMock,
} from './case-file/storage.types';

import {
  IStorageMake as ICaseNoteMakeStorage,
  IStorageMakeMock as ICaseNoteMakeStorageMock,
} from './case-note/storage.types';

export interface IStorage {
  user: IUserStorage;
  caseFile: ICaseFileMakeStorage;
  caseNote: ICaseNoteMakeStorage;
  dashboard: IDashboardStorage;
  event: IEventStorage;
  optionList: IOptionListStorage;
  team: ITeamStorage;
  program: IProgramStorage;
  registration: IRegistrationStorage;
  financialAssistance: IFinancialAssistanceStorage;
  household: IStorageMake;
  userAccount: IUserAccountMakeStorage;
}

export interface IStorageMock {
  user: IUserStorageMock;
  caseFile: ICaseFileMakeStorageMock;
  caseNote: ICaseNoteMakeStorageMock;
  dashboard: IDashboardStorageMock;
  event: IEventStorageMock;
  optionList: IOptionListStorageMock;
  team: ITeamStorageMock;
  program: IProgramStorageMock;
  registration: IRegistrationMock;
  financialAssistance: IFinancialAssistanceStorageMock;
  household: IStorageMakeMock;
  userAccount: IUserAccountMakeStorageMock;
}
