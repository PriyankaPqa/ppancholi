import Vue from 'vue';
import { provider } from '@/services/provider';

export default (): void => {
  Vue.mixin({
    beforeCreate() {
      this.$services = provider();
    },
  });
};
