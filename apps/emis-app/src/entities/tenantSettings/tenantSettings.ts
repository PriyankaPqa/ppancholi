import { BaseEntity } from '@libs/core-lib/entities/base';
import { IMultilingual } from '@/types';
import {
  IBrandingEntity, IFeatureEntity, ITenantSettingsEntity, ITenantSettingsEntityData,
} from './tenantSettings.types';

export class TenantSettingsEntity extends BaseEntity implements ITenantSettingsEntity {
  slug: string;

  emisDomain: IMultilingual;

  registrationDomain: IMultilingual;

  availableLanguages: Array<string>;

  features: Array<IFeatureEntity>;

  branding: IBrandingEntity;

  supportEmails: IMultilingual;

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

    this.availableLanguages = data?.availableLanguages || [];

    this.features = data?.features || [];

    if (data?.branding) {
      this.branding = data.branding;
      this.branding.showName = !data.branding.hideName;
    }

    this.supportEmails = data?.supportEmails || {
      translation: {
        en: '',
        fr: '',
      },
    };
  }
}
