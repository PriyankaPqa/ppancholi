import Vue from 'vue';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';

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
