import { IHttpClient } from '@/services/httpClient';
import { IOptionItemData, IIndigenousIdentityData } from '@/entities/beneficiary';
import { IAzureSearchParams, IAzureSearchResult } from '@/types';
import { IBeneficiariesService } from './beneficiaries.types';

export class BeneficiariesService implements IBeneficiariesService {
  constructor(private readonly http: IHttpClient) {}

  getGenders(): Promise<IOptionItemData[]> {
    return this.http.get<IOptionItemData[]>('/beneficiary/genders');
  }

  getPreferredLanguages(): Promise<IOptionItemData[]> {
    return this.http.get<IOptionItemData[]>('/beneficiary/preferred-languages');
  }

  getPrimarySpokenLanguages(): Promise<IOptionItemData[]> {
    return this.http.get<IOptionItemData[]>('/beneficiary/primary-spoken-languages');
  }

  searchIndigenousIdentities(params: IAzureSearchParams): Promise<IAzureSearchResult<IIndigenousIdentityData>> {
    return this.http.get('/public-search/indigenous-identities', {
      params,
      isOData: true,
    });
  }
}
