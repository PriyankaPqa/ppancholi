import { IFeatureEntity } from '@/entities/feature';
import { IDomainBaseService, IDomainBaseServiceMock } from '@/services/base';

export interface IFeaturesService extends IDomainBaseService<IFeatureEntity, uuid> {}

export interface IFeaturesServiceMock extends IDomainBaseServiceMock<IFeatureEntity> {}
