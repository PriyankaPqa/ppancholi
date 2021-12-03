import { IMultilingual } from '@/types';
import applicationInsights from '@crctech/registration-lib/src/plugins/applicationInsights/applicationInsights';
import { Toasted } from 'vue-toasted';

interface IMFunction {
  (value: IMultilingual): string;
}

declare module 'vue/types/vue' {
  interface Vue {
    $m: IMFunction;
    $toasted: Toasted;
    $appInsights: typeof applicationInsights;
  }
}
