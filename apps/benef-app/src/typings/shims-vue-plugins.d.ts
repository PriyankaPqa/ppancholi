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
    $featureKeys: typeof FeatureKeys;
    $confirm: ({
      title, messages, htmlContent, submitActionLabel, cancelActionLabel, showCancelButton,
    }: {
      title: TranslateResult, messages: TranslateResult | TranslateResult[],
      htmlContent?: string,
      submitActionLabel?: TranslateResult,
      cancelActionLabel?: TranslateResult,
      showCancelButton?: boolean
    }) => Promise<boolean>;

    $message: ({
      title, message, submitActionLabel, minHeight, maxWidth,
    }: {
      title: TranslateResult,
      message: TranslateResult,
      submitActionLabel?: TranslateResult,
      minHeight?: number | string,
      maxWidth?: number | string
    }) => boolean;
  }
}
