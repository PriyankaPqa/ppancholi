import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import { IRootState } from './store.types';
import { registration } from './modules/registration';
import { beneficiary } from './modules/beneficiary';

Vue.use(Vuex);

const store: StoreOptions<IRootState> = {
  strict: process.env.NODE_ENV !== 'production',
  state: {
    version: '1.0.0', // a simple property
  },
  modules: {
    beneficiary,
    registration,
  },
};

export default new Vuex.Store<IRootState>(store);
