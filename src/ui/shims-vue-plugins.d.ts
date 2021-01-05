import VueRouter, { Route } from 'vue-router';
import { Store } from 'vuex';
import { Toasted } from 'vue-toasted';
import { IMultilingual } from '@/types';

interface IMFunction {
  (value: IMultilingual): string;
}

interface IFormatCurrency {
  (value: number): string;
}

declare module 'vue/types/vue' {
  interface Vue {
    $router: VueRouter;
    $route: Route;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $store: Store<any>;
    $toasted: Toasted;
    $m: IMFunction;
    $formatCurrency: IFormatCurrency;
  }
}
