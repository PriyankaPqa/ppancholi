import Vue from 'vue';
import { IStore, IState } from '@/store';
import { makeStorage } from '@/store/storage';

export default (store: IStore<IState>): void => {
  Vue.mixin({
    beforeCreate() {
      this.$storage = makeStorage(store);
    },
  });
};
