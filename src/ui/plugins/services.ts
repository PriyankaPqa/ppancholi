import Vue from 'vue';
import { provider } from '@/services/provider';
// import { IStore } from '@/store';

export default (/* store: IStore */): void => {
  // store.$services = provider();

  Vue.mixin({
    beforeCreate() {
      this.$services = provider();
      // this.$services = store.$services;
    },
  });
};
