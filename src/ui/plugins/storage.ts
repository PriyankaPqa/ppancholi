import Vue from 'vue';
import { IStore } from '@/store';
import { makeStorage } from '@/store/storage';

export default (store: IStore): void => {
  Vue.mixin({
    beforeCreate() {
      this.$storage = makeStorage(store);
    },
  });
};
