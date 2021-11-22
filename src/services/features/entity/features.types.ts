import { IFeatureEntity } from '@/entities/feature';
import { IDomainBaseService, IDomainBaseServiceMock } from '@/services/base';

export interface IFeaturesService extends IDomainBaseService<IFeatureEntity, uuid> {
  enableFeature(featureId: uuid): Promise<IFeatureEntity>;

  disableFeature(featureId: uuid): Promise<IFeatureEntity>;
}

export interface IFeaturesServiceMock extends IDomainBaseServiceMock<IFeatureEntity> {
  enableFeature: jest.Mock<IFeatureEntity>;

  disableFeature: jest.Mock<IFeatureEntity>;
}
