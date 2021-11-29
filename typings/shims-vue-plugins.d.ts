import VueRouter, { Route } from 'vue-router';
import { Store } from 'vuex';
import { Toasted } from 'vue-toasted';
import { TranslateResult } from 'vue-i18n';
import { IMultilingual } from '@/types';
import { SignalRConnection } from '@/ui/plugins/signalR';

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
    $signalR: SignalRConnection;
    $toasted: Toasted;
    $formatCurrency: IFormatCurrency;
    $m: IMFunction;
    $hasLevel: (p: string) => boolean;
    $hasRole: (p: string) => boolean;
    $confirm: (title: TranslateResult, messages: TranslateResult | TranslateResult[],
      htmlContent?: string, submitActionLabel?: TranslateResult,) => Promise<boolean>;
    $message: ({
      title, message, submitActionLabel, minHeight, maxWidth,
    } :{title: TranslateResult,
      message: TranslateResult,
      submitActionLabel?: TranslateResult,
      minHeight?: number | string,
      maxWidth?: number | string }) => boolean;
  }
}
