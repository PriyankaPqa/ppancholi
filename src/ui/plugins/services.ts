import Vue from 'vue';
import { provider } from '@/services/provider';
import { IStore, IState } from '@/store';

export default (store: IStore<IState>): void => {
  store.$services = provider();

  Vue.mixin({
    beforeCreate() {
      this.$services = provider();
      this.$services = store.$services;
    },
  });
};
