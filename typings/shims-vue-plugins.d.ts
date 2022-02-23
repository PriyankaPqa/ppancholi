import VueRouter, { Route } from 'vue-router';
import { Store } from 'vuex';
import { Toasted } from 'vue-toasted';
import { TranslateResult } from 'vue-i18n';
import applicationInsights from '@crctech/registration-lib/src/plugins/applicationInsights/applicationInsights';
import { IMultilingual } from '@/types';
import { SignalR } from '@/ui/plugins/signalR';
import { FeatureKeys } from '@/entities/tenantSettings';

interface IFormatCurrency {
  (value: number): string;
}

interface IMFunction {
  (value: IMultilingual): string;
}

declare module 'vue/types/vue' {
  interface Vue {
    $router: VueRouter;
    $route: Route;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $store: Store<any>;
    $signalR: SignalR;
    $toasted: Toasted;
    $formatCurrency: IFormatCurrency;
    $m: IMFunction;
    $hasLevel: (p: string) => boolean;
    $appInsights: typeof applicationInsights;
    $hasRole: (p: string) => boolean;
    $hasFeature: (feature: FeatureKeys) => boolean;
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
    } :{title: TranslateResult,
      message: TranslateResult,
      submitActionLabel?: TranslateResult,
      minHeight?: number | string,
      maxWidth?: number | string }) => boolean;
  }
}
