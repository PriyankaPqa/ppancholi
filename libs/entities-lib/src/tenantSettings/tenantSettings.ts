import _cloneDeep from 'lodash/cloneDeep';
import { IMultilingual } from '@libs/shared-lib/types';
import utils from '../utils';
import { BaseEntity } from '../base';
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
    this.emisDomain = utils.initMultilingualAttributes(data?.emisDomain);
    this.registrationDomain = utils.initMultilingualAttributes(data?.registrationDomain);
    this.availableLanguages = data?.availableLanguages ? [...data.availableLanguages] : [];

    this.features = _cloneDeep(data?.features) || [];

    if (data?.branding) {
      this.branding = _cloneDeep(data.branding);
      this.branding.showName = !data.branding.hideName;
    }

    this.supportEmails = utils.initMultilingualAttributes(data?.supportEmails);
  }
}
