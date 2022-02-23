/* eslint-disable */
import { IStorage } from '../src/store/storage/storage.types';

import Vue, { ComponentOptions } from "vue";

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    storage?: IStorage;
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $storage: IStorage;
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $storage: IStorage;
  }
}



declare module 'vue/types/vue' {
  interface Vue {
    $storage: IStorage;
  }
}
