/* eslint-disable */
import { IStorage } from '@/store/storage';

declare module 'vue/types/options' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ComponentOptions<V extends Vue> {
    storage?: IStorage
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $storage: any
  }
}

declare module 'vuex/types/index' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Store<S> {
    $storage: any
  }
}
