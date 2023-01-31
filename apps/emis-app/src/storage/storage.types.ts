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
  IStorageMake as IFinancialAssistanceCategoryMakeStorage,
  IStorageMakeMock as IFinancialAssistanceCategoryMakeStorageMock,
} from './financial-assistance-category';

export interface IStorage {
  caseFile: ICaseFileMakeStorage;
  financialAssistance: IFinancialAssistanceMakeStorage;
  financialAssistanceCategory: IFinancialAssistanceCategoryMakeStorage;
  household: IStorageMake;
  userAccount: IUserAccountMakeStorage;
}

export interface IStorageMock {
  caseFile: ICaseFileMakeStorageMock;
  financialAssistance: IFinancialAssistanceMakeStorageMock;
  financialAssistanceCategory: IFinancialAssistanceCategoryMakeStorageMock;
  household: IStorageMakeMock;
  userAccount: IUserAccountMakeStorageMock;
}
