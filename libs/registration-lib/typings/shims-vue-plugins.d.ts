/* eslint-disable */

import { IMultilingual } from '../src/types';
import { Toasted } from 'vue-toasted';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';

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
    $formatCurrency: IFormatCurrency;
    $m: IMFunction;
    $hasLevel: (p: string) => boolean;
    $hasRole: (p: string) => boolean;
    $hasFeature: (feature: FeatureKeys) => boolean;
  }
}
