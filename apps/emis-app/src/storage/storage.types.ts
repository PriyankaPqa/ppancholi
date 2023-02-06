import { IStorageMake as IFinancialAssistanceMakeStorage, IStorageMakeMock as IFinancialAssistanceMakeStorageMock } from './financial-assistance';

import {
  IStorageMake as ICaseFileMakeStorage,
  IStorageMakeMock as ICaseFileMakeStorageMock,
} from './case-file/storage.types';

export interface IStorage {
  caseFile: ICaseFileMakeStorage;
  financialAssistance: IFinancialAssistanceMakeStorage;
}

export interface IStorageMock {
  caseFile: ICaseFileMakeStorageMock;
  financialAssistance: IFinancialAssistanceMakeStorageMock;
}
