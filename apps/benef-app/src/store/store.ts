import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import { HouseholdEntityModule } from '@libs/registration-lib/store/modules/household';
import { HouseholdsService } from '@libs/services-lib/households/entity';
import { HouseholdMetadataModule } from '@libs/registration-lib/store/modules/household/householdMetadata';
import { HouseholdMetadataService } from '@libs/services-lib/households/metadata';
import * as vuexModule from '@/constants/vuex-modules';
import { httpClient } from '@/services/httpClient';
import { IRootState } from './store.types';

Vue.use(Vuex);

const store: StoreOptions<IRootState> = {
  strict: process.env.VITE_APP_ENV !== 'production',
  state: {
    version: '1.0.0', // a simple property
  },
  modules: {
    [vuexModule.HOUSEHOLD_ENTITIES]: new HouseholdEntityModule(new HouseholdsService(httpClient)).getModule(),
    [vuexModule.HOUSEHOLD_METADATA]: new HouseholdMetadataModule(new HouseholdMetadataService(httpClient)).getModule(),
  },
};

export default new Vuex.Store<IRootState>(store);
