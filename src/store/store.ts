import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import { makeRegistrationModule } from '@crctech/registration-lib/src/store/modules/registration/';
import { makeBeneficiaryModule } from '@crctech/registration-lib/src/store/modules/beneficiary/';
import { i18n } from '@/ui/plugins';
import { IRootState } from './store.types';
import { user } from './modules/user';
import { caseFile } from './modules/case-file';
import { dashboard } from './modules/dashboard';
import { optionList } from './modules/optionList';
import { event } from './modules/event';
import { team } from './modules/team';
import { appUser } from './modules/app-user';
import { program } from './modules/program';

import { tabs } from './modules/registration/tabs';

Vue.use(Vuex);

const store: StoreOptions<IRootState> = {
  strict: process.env.NODE_ENV !== 'production',
  state: {
    version: '1.0.0', // a simple property
  },
  modules: {
    appUser,
    caseFile,
    user,
    dashboard,
    event,
    optionList,
    team,
    program,
    beneficiary: makeBeneficiaryModule(),
    registration: makeRegistrationModule({
      i18n, tabs, skipAgeRestriction: true, skipEmailPhoneRules: true,
    }),
  },
};

export default new Vuex.Store<IRootState>(store);
