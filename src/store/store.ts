import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import { IRootState } from './store.types';
import { user } from './modules/user';
import { caseFile } from './modules/case-file';
import { dashboard } from './modules/dashboard';
import { optionList } from './modules/optionList';
import { event } from './modules/event';
import { team } from './modules/team';
import { appUser } from './modules/app-user';
import { program } from './modules/program';

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
  },
};

export default new Vuex.Store<IRootState>(store);
