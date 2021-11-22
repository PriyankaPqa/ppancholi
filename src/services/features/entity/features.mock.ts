import { mockFeatureEntity } from '@/entities/feature';
import { mockDomainBaseService } from '@/services/base/base.mock';
import { IFeaturesServiceMock } from './features.types';

export const mockFeaturesService = (): IFeaturesServiceMock => ({
  ...mockDomainBaseService([mockFeatureEntity()]),

  enableFeature: jest.fn(() => mockFeatureEntity()),

  disableFeature: jest.fn(() => mockFeatureEntity()),
});
