import { HouseholdStorage } from '@libs/registration-lib/store/storage/household';
import * as vuexModule from '@/constants/vuex-modules';
import { UserAccountStorage } from '@/storage/user-account/storage';
import { CaseFileStorage } from '@/storage/case-file/storage';
import { FinancialAssistanceStorage } from '@/storage/financial-assistance/storage';
import { IStore, IState } from '../store/store.types';
import { IStorage } from './storage.types';
import { makeStorage as makeOptionListStorage } from './optionList';
import { TeamStorage } from './team';
import { FinancialAssistanceCategoryStorage } from './financial-assistance-category';
import { FinancialAssistancePaymentStorage } from './financial-assistance-payment';

export const makeStorage = (store: IStore<IState>): IStorage => ({
  caseFile: new CaseFileStorage(store, vuexModule.CASE_FILE_ENTITIES, vuexModule.CASE_FILE_METADATA).make(),
  optionList: makeOptionListStorage(store),
  team: new TeamStorage(store, vuexModule.TEAM_ENTITIES, vuexModule.TEAM_METADATA).make(),
  financialAssistance: new FinancialAssistanceStorage(
    store,
    vuexModule.FINANCIAL_ASSISTANCE_ENTITIES,
    vuexModule.FINANCIAL_ASSISTANCE_METADATA,
  ).make(),
  household: new HouseholdStorage(store, vuexModule.HOUSEHOLD_ENTITIES, vuexModule.HOUSEHOLD_METADATA).make(),
  userAccount: new UserAccountStorage(store, vuexModule.USER_ACCOUNT_ENTITIES, vuexModule.USER_ACCOUNT_METADATA).make(),
  financialAssistanceCategory: new FinancialAssistanceCategoryStorage(store, vuexModule.FINANCIAL_ASSISTANCE_CATEGORY_ENTITIES).make(),
  financialAssistancePayment: new FinancialAssistancePaymentStorage(
    store,
    vuexModule.FINANCIAL_ASSISTANCE_PAYMENT_ENTITIES,
    vuexModule.FINANCIAL_ASSISTANCE_PAYMENT_METADATA,
  ).make(),
});
