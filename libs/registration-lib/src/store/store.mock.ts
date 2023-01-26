import Vuex from 'vuex';
import _cloneDeep from 'lodash/cloneDeep';
import deepmerge from 'deepmerge';
import Vue from 'vue';
import { mockHttp } from '@libs/services-lib/http-client';
import { HouseholdsService } from '@libs/services-lib/households/entity';
import { mockProvider } from '../provider';
import { HouseholdEntityModule } from './modules/household';
import { IState, IStore } from './store.types';

Vue.use(Vuex);

const mockConfig = {
  modules: {
    household: new HouseholdEntityModule(new HouseholdsService(mockHttp())).getModule(),
  },
};

export const mockStore = (overrides = {}, mocks = { dispatch: false, commit: false }) => {
  const baseConfig = _cloneDeep(mockConfig);
  const overs = _cloneDeep(overrides);

  const mergedConfig = deepmerge(baseConfig, overs, {
    arrayMerge: (dest, source) => source,
  });

  const store = new Vuex.Store(mergedConfig) as IStore<IState>;

  if (mocks.dispatch) {
    store.dispatch = jest.fn();
  }
  if (mocks.commit) {
    store.commit = jest.fn();
  }

  store.$services = mockProvider();
  return store;
};
