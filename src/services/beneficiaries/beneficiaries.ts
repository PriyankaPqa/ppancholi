import { IHttpClient } from '@/services/httpClient';
import {
  IOptionItemData, IIndigenousCommunityData,
} from '@/entities/beneficiary';
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

  getIndigenousTypes(): Promise<IOptionItemData[]> {
    return this.http.get<IOptionItemData[]>('/beneficiary/indigenous-types');
  }

  getIndigenousCommunities(): Promise<IIndigenousCommunityData[]> {
    return this.http.get<IIndigenousCommunityData[]>('/beneficiary/indigenous-communities');
  }
}
