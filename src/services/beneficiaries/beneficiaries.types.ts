import {
  IBeneficiary, ICreateBeneficiaryResponse, IIndigenousIdentityData,
} from '../../entities/beneficiary';
import { IAzureSearchParams, IAzureSearchResult, IOptionItemData } from '../../types';

export interface IBeneficiariesService {
  getGenders(): Promise<IOptionItemData[]>;
  getPreferredLanguages(): Promise<IOptionItemData[]>;
  getPrimarySpokenLanguages(): Promise<IOptionItemData[]>;
  searchIndigenousIdentities(params: IAzureSearchParams): Promise<IAzureSearchResult<IIndigenousIdentityData>>;
  submitRegistration(beneficiary: IBeneficiary, eventId: string): Promise<ICreateBeneficiaryResponse>;
}

export interface IBeneficiariesServiceMock {
  getGenders: jest.Mock<IOptionItemData[]>;
  getPreferredLanguages: jest.Mock<IOptionItemData[]>;
  getPrimarySpokenLanguages: jest.Mock<IOptionItemData[]>;
  searchIndigenousIdentities: jest.Mock<IAzureSearchResult<IIndigenousIdentityData>>;
  submitRegistration: jest.Mock<ICreateBeneficiaryResponse>;
}
