import { IStorageMake, IStorageMakeMock } from '@libs/registration-lib/store/storage/household';
import { IStorageMake as IFinancialAssistanceMakeStorage, IStorageMakeMock as IFinancialAssistanceMakeStorageMock } from './financial-assistance';

import {
  IStorageMake as IUserAccountMakeStorage,
  IStorageMakeMock as IUserAccountMakeStorageMock,
} from './user-account/storage.types';

import {
  IStorageMake as ICaseFileMakeStorage,
  IStorageMakeMock as ICaseFileMakeStorageMock,
} from './case-file/storage.types';

import {
  IStorageMake as ITeamMakeStorage,
  IStorageMakeMock as ITeamMakeStorageMock,
} from './team';

import {
  IStorageMake as IFinancialAssistanceCategoryMakeStorage,
  IStorageMakeMock as IFinancialAssistanceCategoryMakeStorageMock,
} from './financial-assistance-category';

import {
  IStorageMake as IFinancialAssistancePaymentMakeStorage,
  IStorageMakeMock as IFinancialAssistancePaymentMakeStorageMock,
} from './financial-assistance-payment';

export interface IStorage {
  caseFile: ICaseFileMakeStorage;
  team: ITeamMakeStorage;
  financialAssistance: IFinancialAssistanceMakeStorage;
  financialAssistanceCategory: IFinancialAssistanceCategoryMakeStorage;
  financialAssistancePayment: IFinancialAssistancePaymentMakeStorage;
  household: IStorageMake;
  userAccount: IUserAccountMakeStorage;
}

export interface IStorageMock {
  caseFile: ICaseFileMakeStorageMock;
  team: ITeamMakeStorageMock;
  financialAssistance: IFinancialAssistanceMakeStorageMock;
  financialAssistanceCategory: IFinancialAssistanceCategoryMakeStorageMock;
  financialAssistancePayment: IFinancialAssistancePaymentMakeStorageMock;
  household: IStorageMakeMock;
  userAccount: IUserAccountMakeStorageMock;
}
