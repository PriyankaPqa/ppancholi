import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import { IRootState } from './store.types';
import { user } from './modules/user';
import { dashboard } from './modules/dashboard';
import { event } from './modules/event';
import { team } from './modules/team';

Vue.use(Vuex);

const store: StoreOptions<IRootState> = {
  state: {
    version: '1.0.0', // a simple property
  },
  modules: {
    user,
    dashboard,
    event,
    team,
  },
};

export default new Vuex.Store<IRootState>(store);
