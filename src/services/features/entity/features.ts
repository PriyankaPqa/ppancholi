import { IFeatureEntity } from '@/entities/feature';
import { DomainBaseService } from '@/services/base';
import { IHttpClient } from '@/services/httpClient';
import { IFeaturesService } from './features.types';

const API_URL_SUFFIX = 'system-management';
const ENTITY = 'features';

export class FeaturesService extends DomainBaseService<IFeatureEntity, uuid> implements IFeaturesService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, ENTITY);
  }
}
