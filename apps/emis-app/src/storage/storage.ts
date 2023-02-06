import * as vuexModule from '@/constants/vuex-modules';
import { FinancialAssistanceStorage } from '@/storage/financial-assistance/storage';
import { IStore, IState } from '../store/store.types';
import { IStorage } from './storage.types';

export const makeStorage = (store: IStore<IState>): IStorage => ({
  financialAssistance: new FinancialAssistanceStorage(
    store,
    vuexModule.FINANCIAL_ASSISTANCE_ENTITIES,
    vuexModule.FINANCIAL_ASSISTANCE_METADATA,
  ).make(),
});
