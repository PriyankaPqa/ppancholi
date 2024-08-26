import { IMultilingual } from '@libs/shared-lib/types';
import { BaseEntity } from '../base';
import utils from '../utils';
import { FeatureType, FeatureVisibility, IFeatureEntity } from './tenantSettings.types';

export class FeatureEntity extends BaseEntity implements IFeatureEntity {
  name: IMultilingual;

  description: IMultilingual;

  key: string;

  enabled: boolean;

  canEnable: boolean;

  canDisable: boolean;

  type: FeatureType;

  visibility: FeatureVisibility;

  constructor(data?: IFeatureEntity) {
    super(data);
    this.name = utils.initMultilingualAttributes(data?.name);
    this.description = utils.initMultilingualAttributes(data?.description);
    this.key = data?.key || '';
    this.enabled = data?.enabled || false;
    this.canEnable = data?.canEnable || false;
    this.canDisable = data?.canDisable || false;
    this.type = data?.type || FeatureType.Temporary;
    this.visibility = data?.visibility || FeatureVisibility.Private;
  }
}
