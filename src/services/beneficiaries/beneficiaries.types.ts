import {
  IOptionItemData, IIndigenousCommunityData,
} from '@/entities/beneficiary';

export interface IBeneficiariesService {
  getGenders(): Promise<IOptionItemData[]>;
  getPreferredLanguages(): Promise<IOptionItemData[]>;
  getPrimarySpokenLanguages(): Promise<IOptionItemData[]>;
  getIndigenousTypes(): Promise<IOptionItemData[]>;
  getIndigenousCommunities(): Promise<IIndigenousCommunityData[]>;
}

export interface IBeneficiariesServiceMock {
  getGenders: jest.Mock<IOptionItemData[]>;
  getPreferredLanguages: jest.Mock<IOptionItemData[]>;
  getPrimarySpokenLanguages: jest.Mock<IOptionItemData[]>;
  getIndigenousTypes: jest.Mock<IOptionItemData[]>;
  getIndigenousCommunities: jest.Mock<IIndigenousCommunityData[]>;
}
