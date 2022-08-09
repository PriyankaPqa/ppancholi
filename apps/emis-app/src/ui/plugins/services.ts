import Vue from 'vue';
import { IStore, IState } from '@/store';
import { provider } from '@/services/provider';

export default (store: IStore<IState>): void => {
  store.$services = provider();

  Vue.mixin({
    beforeCreate() {
      this.$services = provider();
      this.$services = store.$services;
    },
  });
};
