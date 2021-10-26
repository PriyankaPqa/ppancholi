import { mockFeatureEntity } from '@/entities/feature';
import { mockDomainBaseService } from '@/services/base/base.mock';
import { IFeaturesServiceMock } from './features.types';

export const mockProgramsService = (): IFeaturesServiceMock => ({
  ...mockDomainBaseService([mockFeatureEntity()]),
});
