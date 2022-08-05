import { TranslateResult } from 'vue-i18n';
import { INavigationTab } from './INavigationTab';

export interface INavigationTabGroup {
  name: string | TranslateResult;
  items: Array<INavigationTab>
}
