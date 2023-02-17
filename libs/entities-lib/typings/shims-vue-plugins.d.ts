/* eslint-disable */
import { IMultilingual } from '../src/types';
import { Toasted } from 'vue-toasted';

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
    $toasted: Toasted;
  }
}
