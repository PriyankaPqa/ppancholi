import {
  IAddress,
  IContactInformation, ICurrentAddress,
  IHouseholdCreate, IIdentitySet, IIndigenousCommunityData, IMember, IMemberEntity, IValidateEmailRequest, IValidateEmailResponse,
} from '../../../entities/household-create';
import { IOptionItemData } from '../../../types';
import { IHouseholdEntity } from '../../../entities/household';
import { IVersionedEntityCombined } from '../../../entities/value-objects/versioned-entity';

export interface IHouseholdsService {
  getGenders(): Promise<IOptionItemData[]>;
  getPreferredLanguages(): Promise<IOptionItemData[]>;
  getPrimarySpokenLanguages(): Promise<IOptionItemData[]>;
  getIndigenousCommunities(): Promise<IIndigenousCommunityData[]>;
  getPerson(id: uuid): Promise<IMemberEntity>;
  submitRegistration(household: IHouseholdCreate, eventId: string): Promise<IHouseholdEntity>;
  submitCRCRegistration(household: IHouseholdCreate, eventId: string): Promise<IHouseholdEntity>;
  updatePersonContactInformation(id: string,
      payload: { contactInformation: IContactInformation; isPrimaryBeneficiary: boolean; identitySet: IIdentitySet }): Promise<IHouseholdEntity> | false;
  updatePersonIdentity(id: string,
    payload: { contactInformation: IContactInformation; identitySet: IIdentitySet }): Promise<IHouseholdEntity> | false;
  updatePersonAddress(id: string, payload: ICurrentAddress): Promise<IHouseholdEntity> | false;
  updateHomeAddress(id: string, payload: IAddress): Promise<IHouseholdEntity> | false;
  updateNoFixedHomeAddress(id: string, observation?: string): Promise<IHouseholdEntity> | false;
  deleteAdditionalMember(householdId: string, memberId: string): Promise<IHouseholdEntity>;
  // splitMembers(householdId: string, memberIds: string[]): Promise<IHouseholdEntity>;
  addMember(householdId: string, payload: IMember): Promise<IHouseholdEntity>;
  validateEmail(request: IValidateEmailRequest): Promise<IValidateEmailResponse>;
  getHouseholdHistory(id: uuid): Promise<IVersionedEntityCombined[]>;
  getHouseholdMetadataHistory(id: uuid): Promise<IVersionedEntityCombined[]>;
  getMemberHistory(id: uuid): Promise<IVersionedEntityCombined[]>;
  getMemberMetadataHistory(id: uuid): Promise<IVersionedEntityCombined[]>;
}

export interface IHouseholdsServiceMock {
  getGenders: jest.Mock<IOptionItemData[]>;
  getPreferredLanguages: jest.Mock<IOptionItemData[]>;
  getPrimarySpokenLanguages: jest.Mock<IOptionItemData[]>;
  getIndigenousCommunities: jest.Mock<IIndigenousCommunityData[]>;
  submitRegistration: jest.Mock<IHouseholdEntity>;
  getPerson: jest.Mock<IMemberEntity>;
  submitCRCRegistration: jest.Mock<IHouseholdEntity>;
  updatePersonContactInformation: jest.Mock<IHouseholdEntity>;
  updatePersonIdentity: jest.Mock<IHouseholdEntity>;
  updatePersonAddress: jest.Mock<IHouseholdEntity>;
  updateHomeAddress: jest.Mock<IHouseholdEntity>;
  updateNoFixedHomeAddress: jest.Mock<IHouseholdEntity>;
  deleteAdditionalMember: jest.Mock<IHouseholdEntity>;
  // splitMembers: jest.Mock<IHouseholdEntity>;
  addMember: jest.Mock<IHouseholdEntity>;
  validateEmail: jest.Mock<IValidateEmailResponse>;
  getHouseholdHistory: jest.Mock<IVersionedEntityCombined[]>;
  getHouseholdMetadataHistory: jest.Mock<IVersionedEntityCombined[]>;
  getMemberHistory: jest.Mock<IVersionedEntityCombined[]>;
  getMemberMetadataHistory: jest.Mock<IVersionedEntityCombined[]>;
}
