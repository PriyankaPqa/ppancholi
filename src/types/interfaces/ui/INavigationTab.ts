import { TranslateResult } from 'vue-i18n';
import { FeatureKeys } from '../../../entities/tenantSettings/tenantSettings.types';

export interface INavigationTab {
  text: string | TranslateResult;
  test: string;
  icon?: string;
  disabled?: boolean;
  to?: string;
  exact?: boolean;
  level?: string;
  roles?: string[];
  feature?: FeatureKeys;
  active?: boolean;
  onClick?: string;
}

export interface INavigationTabGroup {
  name: string | TranslateResult;
  items: Array<INavigationTab>
}
