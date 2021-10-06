import { IEntity, mockBaseData } from '@/entities/base';
import {
  IBrandingCombined, IBrandingEntity, IBrandingEntityData, IEditColoursRequest, IEditTenantDetailsRequest,
} from './branding.types';

export const mockEditColoursRequest = (): IEditColoursRequest => ({
  colours: {
    primary: '#007DA3',
    primaryLight: '#A7D0E1',
    primaryDark: '#005670',
    secondary: '#EE0000',
  },
});

export const mockEditTenantDetailsRequest = (): IEditTenantDetailsRequest => ({
  name: {
    translation: {
      en: 'name en',
      fr: 'name fr',
    },
  },
  description: {
    translation: {
      en: 'description en',
      fr: 'description fr',
    },
  },
  hideName: false,
});

export const mockBrandingEntityData = (force?: Partial<IBrandingEntityData>): IBrandingEntityData => ({
  ...mockBaseData(),

  ...mockEditColoursRequest(),

  ...mockEditTenantDetailsRequest(),

  ...force,
});

export const mockBrandingEntity = (force?: Partial<IBrandingEntity>): IBrandingEntity => ({
  ...mockBrandingEntityData(),

  showName: true,

  ...force,
});

export const mockCombinedBranding = (force?: Partial<IEntity>): IBrandingCombined => ({
  metadata: null as never,
  entity: mockBrandingEntity(force),
});
