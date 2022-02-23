import { FeatureKeys } from '@libs/registration-lib/entities/tenantSettings';
import Vue from 'vue';

export type VuePlugin = Vue & {
  $hasFeature: (featureKey: FeatureKeys) => boolean;
};

export default {
  install: (V: typeof Vue) => {
    function hasFeature(this: Vue, featureKey: FeatureKeys) {
      return this.$storage.tenantSettings.getters.isFeatureEnabled(featureKey);
    }

    V.prototype.$hasFeature = hasFeature;
  },
};
