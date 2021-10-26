import { TranslateResult } from 'vue-i18n';
import { Features } from '../../../entities/feature/feature.types';

export interface INavigationTab {
  text: string | TranslateResult;
  test: string;
  icon?: string;
  disabled?: boolean;
  to?: string;
  exact?: boolean;
  level?: string;
  roles?: string[];
  feature?: Features;
  active?: boolean;
  onClick?: string;
}

export interface INavigationTabGroup {
  name: string | TranslateResult;
  items: Array<INavigationTab>
}
