import Vue from 'vue';
import { IStore } from '@/store';
import { makeStorage as makeUserStorage } from '@/store/storage/user';
import { makeStorage as makeDashboardStorage } from '@/store/storage/dashboard';

export default (store: IStore): void => {
  const storage = {
    user: makeUserStorage(store),
    dashboard: makeDashboardStorage(store),
  };

  Vue.mixin({
    beforeCreate() {
      this.$storage = storage;
    },
  });
};
