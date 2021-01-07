import Vue from 'vue';
import { IStore } from '@/store';
import { makeStorage as makeUserStorage } from '@/store/storage/user';

export default (store: IStore): void => {
  const storage = {
    user: makeUserStorage(store),
  };

  Vue.mixin({
    beforeCreate() {
      this.$storage = storage;
    },
  });
};
