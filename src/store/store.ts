import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import { makeRegistrationModule } from '@crctech/registration-lib/src/store/modules/registration/';
import { makeBeneficiaryModule } from '@crctech/registration-lib/src/store/modules/beneficiary/';
import { i18n } from '@/ui/plugins';
import { tabs } from './modules/registration/tabs';
import { IRootState } from './store.types';

Vue.use(Vuex);

const store: StoreOptions<IRootState> = {
  strict: process.env.NODE_ENV !== 'production',
  state: {
    version: '1.0.0', // a simple property
  },
  modules: {
    beneficiary: makeBeneficiaryModule(),
    registration: makeRegistrationModule(i18n, tabs),
  },
};

export default new Vuex.Store<IRootState>(store);
