import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import { makeRegistrationModule } from '@crctech/registration-lib/src/store/modules/registration/';
import { HouseholdEntityModule } from '@crctech/registration-lib/src/store/modules/household';
import { i18n } from '@/ui/plugins';
import { ERegistrationMode } from '@crctech/registration-lib/src/types';
import { HouseholdsService } from '@crctech/registration-lib/src/services/households/entity';
import { httpClient } from '@/services/httpClient';
import * as vuexModule from '@/constants/vuex-modules';
import { HouseholdMetadataModule } from '@crctech/registration-lib/src/store/modules/household/householdMetadata';
import { HouseholdMetadataService } from '@crctech/registration-lib/src/services/households/metadata';
import { TenantSettingsEntityModule } from '@crctech/registration-lib/src/store/modules/tenantSettings/tenantSettingsEntity';
import { TenantSettingsService } from '@crctech/registration-lib/src/services/tenantSettings/entity';
import vuetify from '@/ui/plugins/vuetify/vuetify';
import { IRootState } from './store.types';
import { tabs } from './modules/registration/tabs';

Vue.use(Vuex);

const store: StoreOptions<IRootState> = {
  strict: process.env.NODE_ENV !== 'production',
  state: {
    version: '1.0.0', // a simple property
  },
  modules: {
    [vuexModule.HOUSEHOLD_ENTITIES]: new HouseholdEntityModule(new HouseholdsService(httpClient)).getModule(),
    [vuexModule.HOUSEHOLD_METADATA]: new HouseholdMetadataModule(new HouseholdMetadataService(httpClient)).getModule(),
    [vuexModule.REGISTRATION_MODULE]: makeRegistrationModule({
      i18n, tabs: tabs(), skipAgeRestriction: false, skipEmailPhoneRules: false, mode: ERegistrationMode.Self,
    }),
    [vuexModule.TENANT_SETTINGS_ENTITIES]: new TenantSettingsEntityModule(
      new TenantSettingsService(httpClient),
      vuetify,
    ).getModule(),
  },
};

export default new Vuex.Store<IRootState>(store);
