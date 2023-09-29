import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { TranslateResult } from 'vue-i18n';

export interface ICardSettings {
  title: string;
  description?: string | TranslateResult;
  button: string;
  secondaryButton?: string;
  showSecondaryButton?: boolean;
  route: string;
  dataTest: string;
  level: string;
  roles?: Array<string>;
  onClick?: string;
  onClickMenu?: string;
  onSecondaryClick?: string;
  feature?: FeatureKeys
  secondaryButtonIsMenu?: boolean;
  secondaryMenuItems?: Array<Record<string, unknown>>
}
