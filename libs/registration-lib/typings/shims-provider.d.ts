import { IProvider, IProviderMock } from '../src/services/provider';
/* eslint-disable */
declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    services?: IProvider | IProviderMock
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $services: IProvider | IProviderMock
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $services: IProvider | IProviderMock
  }
}
