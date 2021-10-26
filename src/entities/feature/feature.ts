import { BaseEntity } from '@/entities/base/base';
import { IMultilingual } from '@/types';
import { IFeatureEntity, IFeatureEntityData } from './feature.types';

export class FeatureEntity extends BaseEntity implements IFeatureEntity {
  name: string;

  description: IMultilingual;

  enabled: boolean;

  constructor(data?: IFeatureEntityData) {
    if (data) {
      super(data);
      this.name = data.name;
      this.description = data.description;
      this.enabled = data.enabled;
    } else {
      super();
    }
  }
}
