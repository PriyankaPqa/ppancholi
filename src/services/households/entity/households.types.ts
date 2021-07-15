import {
  IAddress,
  IContactInformation, ICurrentAddress,
  IHouseholdCreate, IIdentitySet, IIndigenousIdentityData, IMember, IMemberData,
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
  updatePersonContactInformation(id: string, payload: IContactInformation): Promise<IHouseholdEntity> | false;
  updatePersonIdentity(id: string, payload: IIdentitySet): Promise<IHouseholdEntity> | false;
  updatePersonAddress(id: string, payload: ICurrentAddress): Promise<IHouseholdEntity> | false;
  updateHomeAddress(id: string, payload: IAddress): Promise<IHouseholdEntity> | false;
  updateNoFixedHomeAddress(id: string): Promise<IHouseholdEntity> | false;
  deleteAdditionalMember(householdId: string, memberId: string): Promise<IHouseholdEntity>;
  addMember(householdId: string, payload: IMember): Promise<IHouseholdEntity>;
}

export interface IHouseholdsServiceMock {
  getGenders: jest.Mock<IOptionItemData[]>;
  getPreferredLanguages: jest.Mock<IOptionItemData[]>;
  getPrimarySpokenLanguages: jest.Mock<IOptionItemData[]>;
  searchIndigenousIdentities: jest.Mock<IAzureSearchResult<IIndigenousIdentityData>>;
  submitRegistration: jest.Mock<IHouseholdEntity>;
  getPerson: jest.Mock<IMemberData>;
  submitCRCRegistration: jest.Mock<IHouseholdEntity>;
  updatePersonContactInformation: jest.Mock<IHouseholdEntity>;
  updatePersonIdentity: jest.Mock<IHouseholdEntity>;
  updatePersonAddress: jest.Mock<IHouseholdEntity>;
  updateHomeAddress: jest.Mock<IHouseholdEntity>;
  updateNoFixedHomeAddress: jest.Mock<IHouseholdEntity>;
  deleteAdditionalMember: jest.Mock<IHouseholdEntity>;
  addMember: jest.Mock<IHouseholdEntity>;
}
