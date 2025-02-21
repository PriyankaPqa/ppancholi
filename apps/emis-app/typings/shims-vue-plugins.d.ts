import VueRouter, { Route } from 'vue-router';
import { Toasted } from 'vue-toasted';
import { TranslateResult } from 'vue-i18n';
import applicationInsights from '@libs/shared-lib/plugins/applicationInsights/applicationInsights';
import { IMultilingual, IServerError } from '@libs/shared-lib/types';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { SignalR } from '@/ui/plugins/signal-r';
import { User } from '@libs/entities-lib/user';

interface IFormatCurrency {
  (value: number, hideDecimals?: boolean): string;
}

interface IMFunction {
  (value: IMultilingual): string;
}

declare module 'vue/types/vue' {
  interface Vue {
    $router: VueRouter;
    $route: Route;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $signalR: SignalR;
    $toasted: Toasted;
    $formatCurrency: IFormatCurrency;
    $m: IMFunction;
    $hasLevel: (p: string, strictLevel = false) => boolean;
    $appInsights: typeof applicationInsights;
    $hasRole: (p: string) => boolean;
    $currentUser: () => User;
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
    } :{ title: TranslateResult,
      message: TranslateResult,
      submitActionLabel?: TranslateResult,
      minHeight?: number | string,
      maxWidth?: number | string }) => boolean;

    $reportToasted: (message : TranslateResult, error: IServerError | unknown) => null;
  }
}
