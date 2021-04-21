import { IAzureSearchParams, IAzureSearchResult, IOptionItemData } from '@/types';
import { IIndigenousIdentityData } from '../../entities/beneficiary';

export interface IBeneficiariesService {
  getGenders(): Promise<IOptionItemData[]>;
  getPreferredLanguages(): Promise<IOptionItemData[]>;
  getPrimarySpokenLanguages(): Promise<IOptionItemData[]>;
  searchIndigenousIdentities(params: IAzureSearchParams): Promise<IAzureSearchResult<IIndigenousIdentityData>>;
}

export interface IBeneficiariesServiceMock {
  getGenders: jest.Mock<IOptionItemData[]>;
  getPreferredLanguages: jest.Mock<IOptionItemData[]>;
  getPrimarySpokenLanguages: jest.Mock<IOptionItemData[]>;
  searchIndigenousIdentities: jest.Mock<IAzureSearchResult<IIndigenousIdentityData>>;
}
