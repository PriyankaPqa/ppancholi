/* eslint-disable */

import { Store } from 'vuex';
import { IMultilingual } from '@/types';

interface IFormatCurrency {
  (value: number): string;
}

interface IMFunction {
  (value: IMultilingual): string;
}

declare module 'vue/types/vue' {
  interface Vue {
    $router: any;
    $route: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $store: Store<any>;
    $formatCurrency: IFormatCurrency;
    $m: IMFunction;
    $hasLevel: (p: string) => boolean;
    $hasRole: (p: string) => boolean;
  }
}
