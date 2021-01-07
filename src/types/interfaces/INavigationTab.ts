import { TranslateResult } from 'vue-i18n';

export interface INavigationTab {
  text: string | TranslateResult;
  test: string;
  icon?: string;
  disabled?: boolean;
  to?: string;
  exact?: boolean;
  permission?: string;
  active?: boolean;
}
