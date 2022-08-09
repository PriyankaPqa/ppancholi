import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import applicationInsights from '@libs/shared-lib/plugins/applicationInsights/applicationInsights';
import { Toasted } from 'vue-toasted';
import { IMultilingual } from '@libs/shared-lib/types';

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
