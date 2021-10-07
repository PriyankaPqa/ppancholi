import {
  IBrandingCombined, IBrandingEntity, mockBrandingEntity, mockCombinedBranding,
} from '@/entities/branding';
import { BaseMock } from '../base/base.mock';

export class BrandingStorageMock extends BaseMock<IBrandingCombined, IBrandingEntity> {
  constructor() {
    super([mockCombinedBranding()], mockBrandingEntity());
  }

  protected getters = {
    ...this.baseGetters,
    branding: jest.fn(() => mockBrandingEntity()),
    logoUrl: jest.fn(),
  };

  protected actions = {
    ...this.baseActions,
    getUserTenants: jest.fn(() => [mockBrandingEntity()]),
    getBranding: jest.fn(() => mockBrandingEntity()),
    updateColours: jest.fn(() => mockBrandingEntity()),
    updateTenantDetails: jest.fn(() => mockBrandingEntity()),
    getLogoUrl: jest.fn(),
  };

  protected mutations = {
    ...this.baseMutations,
  };

  public make = () => ({
    getters: this.getters,
    actions: this.actions,
    mutations: this.mutations,
  });
}
