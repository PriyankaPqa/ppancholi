import Vuex from 'vuex';
import _cloneDeep from 'lodash/cloneDeep';
import deepmerge from 'deepmerge';
import Vue from 'vue';

import { HouseholdEntityModule } from '@libs/registration-lib/store/modules/household';
import { HouseholdsService } from '@libs/services-lib/households/entity';
import { HouseholdMetadataModule } from '@libs/registration-lib/store/modules/household/householdMetadata';
import { HouseholdMetadataService } from '@libs/services-lib/households/metadata';
import * as vuexModule from '@/constants/vuex-modules';
import { mockProvider } from '@/services/provider';
import { httpClient } from '@/services/httpClient';

Vue.use(Vuex);

const mockConfig = {
  modules: {
    [vuexModule.HOUSEHOLD_ENTITIES]: new HouseholdEntityModule(new HouseholdsService(httpClient)).getModule(),
    [vuexModule.HOUSEHOLD_METADATA]: new HouseholdMetadataModule(new HouseholdMetadataService(httpClient)).getModule(),
  },
};

export const mockStore = (overrides = {}, mocks = { dispatch: false, commit: false }) => {
  const baseConfig = _cloneDeep(mockConfig);
  const overs = _cloneDeep(overrides);

  const mergedConfig = deepmerge(baseConfig, overs, {
    arrayMerge: (dest, source) => source,
  });

  const store = new Vuex.Store(mergedConfig);

  if (mocks.dispatch) {
    store.dispatch = jest.fn();
  }
  if (mocks.commit) {
    store.commit = jest.fn();
  }

  store.$services = mockProvider();
  return store;
};
