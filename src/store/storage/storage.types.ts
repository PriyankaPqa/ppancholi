import { IStorage as IRegistrationStorage, IStorageMock as IRegistrationMock } from '@crctech/registration-lib/src/store/storage/registration';
import { IStorage as IBeneficiaryStorage, IStorageMock as IBeneficiaryMock } from '@crctech/registration-lib/src/store/storage/beneficiary';
import { IStorage as IUserStorage, IStorageMock as IUserStorageMock } from './user';
import { IStorage as ICaseFileStorage, IStorageMock as ICaseFileStorageMock } from './case-file';
import { IStorage as IDashboardStorage, IStorageMock as IDashboardStorageMock } from './dashboard';
import { IStorage as IEventStorage, IStorageMock as IEventStorageMock } from './event';
import { IStorage as IOptionListStorage, IStorageMock as IOptionListStorageMock } from './optionList';
import { IStorage as ITeamStorage, IStorageMock as ITeamStorageMock } from './team';
import { IStorage as IAppUserStorage, IStorageMock as IAppUserStorageMock } from './app-user';
import { IStorage as IProgramStorage, IStorageMock as IProgramStorageMock } from './program';

export interface IStorage {
  appUser: IAppUserStorage;
  user: IUserStorage;
  caseFile: ICaseFileStorage;
  dashboard: IDashboardStorage;
  event: IEventStorage;
  optionList: IOptionListStorage;
  team: ITeamStorage;
  program: IProgramStorage;
  registration: IRegistrationStorage;
  beneficiary: IBeneficiaryStorage;
}

export interface IStorageMock {
  appUser: IAppUserStorageMock;
  user: IUserStorageMock;
  caseFile: ICaseFileStorageMock;
  dashboard: IDashboardStorageMock;
  event: IEventStorageMock;
  optionList: IOptionListStorageMock;
  team: ITeamStorageMock;
  program: IProgramStorageMock;
  registration: IRegistrationMock;
  beneficiary: IBeneficiaryMock;
}
