import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import { IRootState } from './store.types';
import { user } from './modules/user';
import { dashboard } from './modules/dashboard';
import { optionList } from './modules/optionList';
import { event } from './modules/event';
import { team } from './modules/team';
import { appUser } from './modules/app-user';

Vue.use(Vuex);

const store: StoreOptions<IRootState> = {
  strict: process.env.NODE_ENV !== 'production',
  state: {
    version: '1.0.0', // a simple property
  },
  modules: {
    appUser,
    user,
    dashboard,
    event,
    optionList,
    team,
  },
};

export default new Vuex.Store<IRootState>(store);
