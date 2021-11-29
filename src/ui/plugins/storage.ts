import Vue from 'vue';
import { IStore, IState } from '@/store';
import { makeStorage, IStorage } from '@/store/storage';

export default (store: IStore<IState>): IStorage => {
  const storage = makeStorage(store);

  Vue.mixin({
    beforeCreate() {
      this.$storage = storage;
    },
  });

  return storage;
};
