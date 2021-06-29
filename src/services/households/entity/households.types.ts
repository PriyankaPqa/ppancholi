import {
  IHouseholdCreate, IIndigenousIdentityData,
} from '../../../entities/household-create';
import { IAzureSearchParams, IAzureSearchResult, IOptionItemData } from '../../../types';
import {
  IHouseholdEntity,
} from '../../../entities/household';

export interface IHouseholdsService {
  getGenders(): Promise<IOptionItemData[]>;
  getPreferredLanguages(): Promise<IOptionItemData[]>;
  getPrimarySpokenLanguages(): Promise<IOptionItemData[]>;
  searchIndigenousIdentities(params: IAzureSearchParams): Promise<IAzureSearchResult<IIndigenousIdentityData>>;
  submitRegistration(household: IHouseholdCreate, eventId: string): Promise<IHouseholdEntity>;
  submitCRCRegistration(household: IHouseholdCreate, eventId: string): Promise<IHouseholdEntity>;
}

export interface IHouseholdsServiceMock {
  getGenders: jest.Mock<IOptionItemData[]>;
  getPreferredLanguages: jest.Mock<IOptionItemData[]>;
  getPrimarySpokenLanguages: jest.Mock<IOptionItemData[]>;
  searchIndigenousIdentities: jest.Mock<IAzureSearchResult<IIndigenousIdentityData>>;
  submitRegistration: jest.Mock<IHouseholdEntity>;
  submitCRCRegistration: jest.Mock<IHouseholdEntity>;
}
