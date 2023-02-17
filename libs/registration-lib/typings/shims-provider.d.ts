import { IProvider, IProviderMock } from '../src/provider';
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
