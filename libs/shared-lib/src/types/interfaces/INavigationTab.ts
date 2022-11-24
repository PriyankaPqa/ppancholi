import { TranslateResult } from 'vue-i18n';

export interface INavigationTab {
  text: string | TranslateResult;
  test: string;
  icon?: string;
  disabled?: boolean;
  to?: string;
  exact?: boolean;
  level?: string;
  roles?: string[];
  active?: boolean;
  feature?: string; // FeatureKeys
  onClick?: string;
}
