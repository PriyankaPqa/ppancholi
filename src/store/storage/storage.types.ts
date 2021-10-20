import { IStorage as IRegistrationStorage, IStorageMock as IRegistrationMock } from '@crctech/registration-lib/src/store/storage/registration';
import { IStorageMake, IStorageMakeMock } from '@crctech/registration-lib/src/store/storage/household';
import { IStorage as IUserStorage, IStorageMock as IUserStorageMock } from './user';
import { IStorage as IDashboardStorage, IStorageMock as IDashboardStorageMock } from './dashboard';
import { IStorage as IOptionListStorage, IStorageMock as IOptionListStorageMock } from './optionList';
import { IStorageMake as IFinancialAssistanceMakeStorage, IStorageMakeMock as IFinancialAssistanceMakeStorageMock } from './financial-assistance';
import {
  IStorageMake as IUserAccountMakeStorage,
  IStorageMakeMock as IUserAccountMakeStorageMock,
} from './user-account/storage.types';

import {
  IStorageMake as IEventMakeStorage,
  IStorageMakeMock as IEventMakeStorageMock,
} from './event/storage.types';

import {
  IStorageMake as ICaseFileMakeStorage,
  IStorageMakeMock as ICaseFileMakeStorageMock,
} from './case-file/storage.types';

import {
  IStorageMake as ICaseNoteMakeStorage,
  IStorageMakeMock as ICaseNoteMakeStorageMock,
} from './case-note/storage.types';

import {
  IStorageMake as ICaseFileReferralMakeStorage,
  IStorageMakeMock as ICaseFileReferralMakeStorageMock,
} from './case-file-referral';

import {
  IStorageMake as ICaseFileDocumentMakeStorage,
  IStorageMakeMock as ICaseFileDocumentMakeStorageMock,
} from './case-file-document';

import {
  IStorageMake as ITeamMakeStorage,
  IStorageMakeMock as ITeamMakeStorageMock,
} from './team';

import {
  IStorageMake as IMassActionMakeStorage,
  IStorageMakeMock as IMassActionMakeStorageMock,
} from './mass-action';

import {
  IStorageMake as IProgramMakeStorage,
  IStorageMakeMock as IProgramMakeStorageMock,
} from './program';

import {
  IStorageMake as IFinancialAssistanceCategoryMakeStorage,
  IStorageMakeMock as IFinancialAssistanceCategoryMakeStorageMock,
} from './financial-assistance-category';

import {
  IStorageMake as IFinancialAssistancePaymentMakeStorage,
  IStorageMakeMock as IFinancialAssistancePaymentMakeStorageMock,
} from './financial-assistance-payment';

import {
  IStorageMake as IBrandingMakeStorage,
  IStorageMakeMock as IBrandingMakeStorageMock,
} from './branding';

import {
  IStorageMake as ITenantSettingsMakeStorage,
  IStorageMakeMock as ITenantSettingsMakeStorageMock,
} from './tenantSettings';

export interface IStorage {
  user: IUserStorage;
  caseFile: ICaseFileMakeStorage;
  caseNote: ICaseNoteMakeStorage;
  caseFileReferral: ICaseFileReferralMakeStorage;
  caseFileDocument: ICaseFileDocumentMakeStorage;
  dashboard: IDashboardStorage;
  event: IEventMakeStorage;
  optionList: IOptionListStorage;
  team: ITeamMakeStorage;
  program: IProgramMakeStorage;
  registration: IRegistrationStorage;
  financialAssistance: IFinancialAssistanceMakeStorage;
  financialAssistanceCategory: IFinancialAssistanceCategoryMakeStorage;
  financialAssistancePayment: IFinancialAssistancePaymentMakeStorage;
  household: IStorageMake;
  userAccount: IUserAccountMakeStorage;
  massAction: IMassActionMakeStorage;
  branding: IBrandingMakeStorage;
  tenantSettings: ITenantSettingsMakeStorage;
}

export interface IStorageMock {
  user: IUserStorageMock;
  caseFile: ICaseFileMakeStorageMock;
  caseNote: ICaseNoteMakeStorageMock;
  caseFileReferral: ICaseFileReferralMakeStorageMock;
  caseFileDocument: ICaseFileDocumentMakeStorageMock;
  dashboard: IDashboardStorageMock;
  event: IEventMakeStorageMock;
  optionList: IOptionListStorageMock;
  team: ITeamMakeStorageMock;
  program: IProgramMakeStorageMock;
  registration: IRegistrationMock;
  financialAssistance: IFinancialAssistanceMakeStorageMock;
  financialAssistanceCategory: IFinancialAssistanceCategoryMakeStorageMock;
  financialAssistancePayment: IFinancialAssistancePaymentMakeStorageMock;
  household: IStorageMakeMock;
  userAccount: IUserAccountMakeStorageMock;
  massAction: IMassActionMakeStorageMock;
  branding: IBrandingMakeStorageMock;
  tenantSettings: ITenantSettingsMakeStorageMock;
}
