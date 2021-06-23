import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import { makeRegistrationModule } from '@crctech/registration-lib/src/store/modules/registration';
import { i18n } from '@/ui/plugins';
import { ERegistrationMode } from '@crctech/registration-lib/src/types';
import { UserAccountEntityModule } from '@/store/modules/user-account/userAccountEntity';
import { UserAccountsService } from '@/services/user-accounts/entity';
import { UserAccountsMetadataService } from '@/services/user-accounts/metadata';
import { httpClient } from '@/services/httpClient';
import { UserAccountMetadataModule } from '@/store/modules/user-account/userAccountMetadata';
import * as vuexModule from '@/constants/vuex-modules';
import { HouseholdMetadataModule } from '@crctech/registration-lib/src/store/modules/household/householdMetadata';
import { HouseholdMetadataService } from '@crctech/registration-lib/src/services/households/metadata';
import { HouseholdsService } from '@crctech/registration-lib/src/services/households/entity';
import { HouseholdEntityModule } from '@crctech/registration-lib/src/store/modules/household';
import { IRootState } from './store.types';
import { user } from './modules/user';
import { caseFile } from './modules/case-file';
import { dashboard } from './modules/dashboard';
import { optionList } from './modules/optionList';
import { event } from './modules/event';
import { team } from './modules/team';
import { program } from './modules/program';
import { tabs } from './modules/registration/tabs';

Vue.use(Vuex);

const store: StoreOptions<IRootState> = {
  strict: process.env.NODE_ENV !== 'production',
  state: {
    version: '1.0.0', // a simple property
  },
  modules: {
    [vuexModule.CASE_FILE_MODULE]: caseFile,
    [vuexModule.USER_MODULE]: user,
    [vuexModule.DASHBOARD_MODULE]: dashboard,
    [vuexModule.EVENT_MODULE]: event,
    [vuexModule.OPTION_LIST_MODULE]: optionList,
    [vuexModule.TEAM_MODULE]: team,
    [vuexModule.PROGRAM_MODULE]: program,
    [vuexModule.HOUSEHOLD_ENTITIES]: new HouseholdEntityModule(new HouseholdsService(httpClient)).getModule(),
    [vuexModule.HOUSEHOLD_METADATA]: new HouseholdMetadataModule(new HouseholdMetadataService(httpClient)).getModule(),
    [vuexModule.REGISTRATION_MODULE]: makeRegistrationModule({
      i18n, tabs: tabs(), skipAgeRestriction: true, skipEmailPhoneRules: true, mode: ERegistrationMode.CRC,
    }),
    [vuexModule.USER_ACCOUNT_ENTITIES]: new UserAccountEntityModule(new UserAccountsService(httpClient)).getModule(),
    [vuexModule.USER_ACCOUNT_METADATA]: new UserAccountMetadataModule(new UserAccountsMetadataService(httpClient)).getModule(),
  },
};

export default new Vuex.Store<IRootState>(store);
