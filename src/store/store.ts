import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import { IRootState } from './store.types';
import { user } from './modules/user';

Vue.use(Vuex);

const store: StoreOptions<IRootState> = {
  state: {
    version: '1.0.0', // a simple property
  },
  modules: {
    user,
  },
};

export default new Vuex.Store<IRootState>(store);
