import { IProvider } from '@/services/provider';
/* eslint-disable */
declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    services?: IProvider
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $services: IProvider
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $services: IProvider
  }
}
