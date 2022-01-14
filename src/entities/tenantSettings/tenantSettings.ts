import { IMultilingual } from '../../types';
import { IFeatureEntity, ITenantSettingsEntity, ITenantSettingsEntityData } from './tenantSettings.types';

export class TenantSettingsEntity implements ITenantSettingsEntity {
  id: uuid;

  slug: string;

  emisDomain: IMultilingual;

  registrationDomain: IMultilingual;

  availableLanguages: Array<string>;

  features: Array<IFeatureEntity>;

  constructor(data?: ITenantSettingsEntityData) {
    this.id = data?.id;
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

    this.availableLanguages = data?.availableLanguages || [];

    this.features = data?.features || [];
  }
}
