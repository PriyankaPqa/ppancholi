import Vue from 'vue';
import { useTenantSettingsStore } from '@/pinia/tenant-settings/tenant-settings';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';

export type VuePlugin = Vue & {
  $hasFeature: (featureKey: FeatureKeys) => boolean;
};

export default {
  install: (V: typeof Vue) => {
    function hasFeature(this: Vue, featureKey: FeatureKeys) {
      return useTenantSettingsStore().isFeatureEnabled(featureKey);
    }

    V.prototype.$hasFeature = hasFeature;
    V.prototype.$featureKeys = FeatureKeys;
  },
};
