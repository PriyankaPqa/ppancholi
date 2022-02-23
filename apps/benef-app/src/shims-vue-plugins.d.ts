import { IMultilingual } from '@/types';
import { FeatureKeys } from '@libs/registration-lib/entities/tenantSettings';
import applicationInsights from '@libs/registration-lib/plugins/applicationInsights/applicationInsights';
import { Toasted } from 'vue-toasted';

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
