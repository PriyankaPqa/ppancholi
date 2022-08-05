import { ITenantSettingsEntity } from '@libs/entities-lib/tenantSettings';
import { IState } from '../base/base.types';

export interface ITenantSettingsEntityState extends IState<ITenantSettingsEntity> {
  currentTenantSettings: ITenantSettingsEntity;
  logoUrl: {
    en: string;
    fr: string;
  };
}
