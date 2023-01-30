import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import { HouseholdEntityModule } from '@libs/registration-lib/store/modules/household';
import { HouseholdMetadataModule } from '@libs/registration-lib/store/modules/household/householdMetadata';
import { HouseholdsService } from '@libs/services-lib/households/entity';
import { HouseholdMetadataService } from '@libs/services-lib/households/metadata';
import * as vuexModule from '@/constants/vuex-modules';
import { httpClient } from '@/services/httpClient';
import { OptionItemsService } from '@libs/services-lib/optionItems/optionItems';

import { UserAccountEntityModule } from '@/store/modules/user-account/userAccountEntity';
import { UserAccountMetadataModule } from '@/store/modules/user-account/userAccountMetadata';
import { UserAccountsService } from '@libs/services-lib/user-accounts/entity';
import { UserAccountsMetadataService } from '@libs/services-lib/user-accounts/metadata';

import { CaseFileEntityModule } from '@/store/modules/case-file/caseFileEntity';
import { CaseFileMetadataModule } from '@/store/modules/case-file/caseFileMetadata';
import { CaseFilesService } from '@libs/services-lib/case-files/entity';
import { CaseFilesMetadataService } from '@libs/services-lib/case-files/metadata';

import { FinancialAssistanceEntityModule } from '@/store/modules/financial-assistance/financialAssistanceEntity';
import { FinancialAssistanceMetadataModule } from '@/store/modules/financial-assistance/financialAssistanceMetadata';
import { FinancialAssistanceTablesService } from '@libs/services-lib/financial-assistance-tables/entity';
import { FinancialAssistanceTablesMetadataService } from '@libs/services-lib/financial-assistance-tables/metadata';

import { FinancialAssistanceCategoryEntityModule } from '@/store/modules/financial-assistance-category/financialAssistanceCategoryEntity';
import { FinancialAssistanceCategoriesService } from '@libs/services-lib/financial-assistance-categories/entity';
import { FinancialAssistancePaymentsService } from '@libs/services-lib/financial-assistance-payments/entity';
import { FinancialAssistancePaymentsMetadataService } from '@libs/services-lib/financial-assistance-payments/metadata';

import { SignalR } from '@/ui/plugins/signal-r';

import { FinancialAssistancePaymentEntityModule } from './modules/financial-assistance-payments/financialAssistancePaymentEntity';
import { FinancialAssistancePaymentMetadataModule } from './modules/financial-assistance-payments/financialAssistancePaymentMetadata';

import { IRootState } from './store.types';

Vue.use(Vuex);

const store: StoreOptions<IRootState> = {
  strict: process.env.VITE_APP_ENV !== 'production',
  state: {
    version: '1.0.0', // a simple property
  },
  modules: {
    [vuexModule.CASE_FILE_ENTITIES]: new CaseFileEntityModule(
      new CaseFilesService(httpClient),
      new OptionItemsService(httpClient),
      SignalR,
    ).getModule(),

    [vuexModule.CASE_FILE_METADATA]: new CaseFileMetadataModule(
      new CaseFilesMetadataService(httpClient),
      SignalR,
    ).getModule(),

    [vuexModule.FINANCIAL_ASSISTANCE_ENTITIES]: new FinancialAssistanceEntityModule(
      new FinancialAssistanceTablesService(httpClient),
      SignalR,
    ).getModule(),
    [vuexModule.FINANCIAL_ASSISTANCE_METADATA]: new FinancialAssistanceMetadataModule(
      new FinancialAssistanceTablesMetadataService(httpClient),
      SignalR,
    ).getModule(),

    [vuexModule.HOUSEHOLD_ENTITIES]: new HouseholdEntityModule(
      new HouseholdsService(httpClient),
    ).getModule(),
    [vuexModule.HOUSEHOLD_METADATA]: new HouseholdMetadataModule(
      new HouseholdMetadataService(httpClient),
    ).getModule(),

    // User Accounts: do not include SignalR to skip subscribing to changes in this data.
    // The number of entities is too large in the prod CRC tenant, so this cannot be used
    // unless calls to getAll are removed.
    [vuexModule.USER_ACCOUNT_ENTITIES]: new UserAccountEntityModule(
      new UserAccountsService(httpClient),
      new OptionItemsService(httpClient),
      null, // SignalR,
    ).getModule(),
    [vuexModule.USER_ACCOUNT_METADATA]: new UserAccountMetadataModule(
      new UserAccountsMetadataService(httpClient),
      null, // SignalR,
    ).getModule(),

    [vuexModule.FINANCIAL_ASSISTANCE_CATEGORY_ENTITIES]: new FinancialAssistanceCategoryEntityModule(
      new FinancialAssistanceCategoriesService(httpClient),
      SignalR,
    ).getModule(),

    [vuexModule.FINANCIAL_ASSISTANCE_PAYMENT_ENTITIES]: new FinancialAssistancePaymentEntityModule(
      new FinancialAssistancePaymentsService(httpClient),
      SignalR,
    ).getModule(),
    [vuexModule.FINANCIAL_ASSISTANCE_PAYMENT_METADATA]: new FinancialAssistancePaymentMetadataModule(
      new FinancialAssistancePaymentsMetadataService(httpClient),
      SignalR,
    ).getModule(),
  },
};

export default new Vuex.Store<IRootState>(store);
