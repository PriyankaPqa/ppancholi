import { FeatureKeys } from '@libs/registration-lib/entities/tenantSettings';
import applicationInsights from '@libs/core-lib/plugins/applicationInsights/applicationInsights';
import { Toasted } from 'vue-toasted';
import { IMultilingual } from '@/types';

interface IMFunction {
  (value: IMultilingual): string;
}

declare module 'vue/types/vue' {
  interface Vue {
    $m: IMFunction;
    $toasted: Toasted;
    $appInsights: typeof applicationInsights;
    $hasFeature: (feature: FeatureKeys) => boolean;
  }
}
