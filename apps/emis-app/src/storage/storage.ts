import * as vuexModule from '@/constants/vuex-modules';
import { CaseFileStorage } from '@/storage/case-file/storage';
import { FinancialAssistanceStorage } from '@/storage/financial-assistance/storage';
import { IStore, IState } from '../store/store.types';
import { IStorage } from './storage.types';

export const makeStorage = (store: IStore<IState>): IStorage => ({
  caseFile: new CaseFileStorage(store, vuexModule.CASE_FILE_ENTITIES, vuexModule.CASE_FILE_METADATA).make(),
  financialAssistance: new FinancialAssistanceStorage(
    store,
    vuexModule.FINANCIAL_ASSISTANCE_ENTITIES,
    vuexModule.FINANCIAL_ASSISTANCE_METADATA,
  ).make(),
});
