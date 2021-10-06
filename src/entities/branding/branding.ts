import { BaseEntity } from '@/entities/base/base';
import { IMultilingual } from '@/types';
import {
  IBrandingEntity, IBrandingEntityData, IColoursEntity,
} from './branding.types';

export class BrandingEntity extends BaseEntity implements IBrandingEntity {
  colours: IColoursEntity;

  name: IMultilingual;

  description: IMultilingual;

  showName: boolean;

  constructor(data?: IBrandingEntityData) {
    if (data) {
      super(data);
      this.colours = data.colours;
      this.name = data.name;
      this.description = data.description;
      this.showName = !data.hideName;
    } else {
      super();
      this.showName = true;
    }
  }
}
