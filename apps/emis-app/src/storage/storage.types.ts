import { IStorageMake as IFinancialAssistanceMakeStorage, IStorageMakeMock as IFinancialAssistanceMakeStorageMock } from './financial-assistance';

export interface IStorage {
  financialAssistance: IFinancialAssistanceMakeStorage;
}

export interface IStorageMock {
  financialAssistance: IFinancialAssistanceMakeStorageMock;
}
