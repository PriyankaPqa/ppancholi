import {
  IBrandingEntity, IBrandingEntityData, IEditColoursRequest, IEditTenantDetailsRequest,
} from '@/entities/branding';
import { DomainBaseService } from '@/services/base';
import { IHttpClient } from '@/services/httpClient';
import { IBrandingsService } from './brandings.types';

const API_URL_SUFFIX = 'system-management';
const ENTITY = 'brandings';

export class BrandingsService extends DomainBaseService<IBrandingEntity, uuid> implements IBrandingsService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, ENTITY);
  }

  async updateColours(payload: IEditColoursRequest): Promise<IBrandingEntityData> {
    return this.http.patch(`${this.baseUrl}/colours`, payload);
  }

  async updateTenantDetails(payload: IEditTenantDetailsRequest): Promise<IBrandingEntityData> {
    return this.http.patch(`${this.baseUrl}/tenant-details`, payload);
  }

  async getLogoUrl(languageCode: string): Promise<string> {
    const response = await this.http.getFullResponse<BlobPart>(`${this.baseUrl}/logo/${languageCode}`, { responseType: 'blob' });

    const blob = new Blob([response.data], { type: response.headers['content-type'] });
    const url = window.URL.createObjectURL(blob);
    return url;
  }
}
