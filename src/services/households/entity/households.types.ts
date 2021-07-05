import {
  IHouseholdCreate, IIndigenousIdentityData, IMemberData,
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
  getPerson(id: uuid): Promise<IMemberData>;
  submitRegistration(household: IHouseholdCreate, eventId: string): Promise<IHouseholdEntity>;
  submitCRCRegistration(household: IHouseholdCreate, eventId: string): Promise<IHouseholdEntity>;
}

export interface IHouseholdsServiceMock {
  getGenders: jest.Mock<IOptionItemData[]>;
  getPreferredLanguages: jest.Mock<IOptionItemData[]>;
  getPrimarySpokenLanguages: jest.Mock<IOptionItemData[]>;
  searchIndigenousIdentities: jest.Mock<IAzureSearchResult<IIndigenousIdentityData>>;
  submitRegistration: jest.Mock<IHouseholdEntity>;
  getPerson: jest.Mock<IMemberData>;
  submitCRCRegistration: jest.Mock<IHouseholdEntity>;
}
