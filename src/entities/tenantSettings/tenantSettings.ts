import { BaseEntity } from '@/entities/base/base';
import { IMultilingual } from '@/types';
import { ITenantSettingsEntity, ITenantSettingsEntityData } from './tenantSettings.types';

export class TenantSettingsEntity extends BaseEntity implements ITenantSettingsEntity {
  slug: string;

  emisDomain: IMultilingual;

  registrationDomain: IMultilingual;

  constructor(data?: ITenantSettingsEntityData) {
    super(data);
    this.slug = data?.slug || '';
    this.emisDomain = data?.emisDomain || {
      translation: {
        en: '',
        fr: '',
      },
    };
    this.registrationDomain = data?.registrationDomain || {
      translation: {
        en: '',
        fr: '',
      },
    };
  }
}
