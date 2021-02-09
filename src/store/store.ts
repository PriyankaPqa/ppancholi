import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import { IRootState } from './store.types';
import { registration } from './modules/registration';

Vue.use(Vuex);

const store: StoreOptions<IRootState> = {
  state: {
    version: '1.0.0', // a simple property
  },
  modules: {
    registration,
  },
};

export default new Vuex.Store<IRootState>(store);
