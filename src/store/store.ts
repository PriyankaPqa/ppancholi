import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import { makeRegistrationModule } from '@crctech/registration-lib/src/store/modules/registration/';
import { makeHouseholdModule } from '@crctech/registration-lib/src/store/modules/household/';
import { i18n } from '@/ui/plugins';
import { ERegistrationMode } from '@crctech/registration-lib/src/types';
import { tabs } from './modules/registration/tabs';
import { IRootState } from './store.types';

Vue.use(Vuex);

const store: StoreOptions<IRootState> = {
  strict: process.env.NODE_ENV !== 'production',
  state: {
    version: '1.0.0', // a simple property
  },
  modules: {
    household: makeHouseholdModule(),
    registration: makeRegistrationModule({
      i18n, tabs: tabs(), skipAgeRestriction: false, skipEmailPhoneRules: false, mode: ERegistrationMode.Self,
    }),
  },
};

export default new Vuex.Store<IRootState>(store);
