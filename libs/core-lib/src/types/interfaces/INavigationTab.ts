import { TranslateResult } from 'vue-i18n';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';

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
  feature?: FeatureKeys;
  onClick?: string;
}
