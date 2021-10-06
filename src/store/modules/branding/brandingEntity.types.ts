import { IBrandingEntity } from '@/entities/branding';
import { IState } from '../base/base.types';

export interface IBrandingEntityState extends IState<IBrandingEntity> {
  branding: IBrandingEntity;
  logoUrl: {
    en: string;
    fr: string;
  };
}
