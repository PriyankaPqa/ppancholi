import Vue from 'vue';
import { makeStorage, IStorage } from '@/store/storage';
import { IStore, IState } from '@/store';

export default (store: IStore<IState>): IStorage => {
  const storage = makeStorage(store);

  Vue.mixin({
    beforeCreate() {
      this.$storage = storage;
    },
  });

  return storage;
};
