import { IMultilingual } from '../../types/interfaces/IMultilingual';

import { IEntity, IEntityCombined } from '../base/base.types';

export enum Features {
  MassAction = 'mass-action',
}

export interface IFeatureEntityData extends IEntity {
  name: string;
  description: IMultilingual;
  enabled: boolean;
}

export interface IFeatureEntity extends IFeatureEntityData {}

export type IFeatureCombined = IEntityCombined<IFeatureEntity, never>;
