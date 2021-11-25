import {
  IHouseholdCreate,
  IContactInformation,
  IIndigenousCommunityData,
  IMember,
  ICurrentAddress,
  IIdentitySet,
  IMemberEntity,
  IAddress,
  IValidateEmailResponse,
  IValidateEmailRequest,
  IConsentInformation,
} from '../../../entities/household-create';
import { IOptionItemData } from '../../../types';
import { IHouseholdEntity, IOustandingPaymentResponse } from '../../../entities/household';
import { IVersionedEntity } from '../../../entities/value-objects/versioned-entity';
import { IHouseholdActivity } from '../../../entities/value-objects/household-activity';

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
  addMember(householdId: string, payload: IMember): Promise<IHouseholdEntity>;
  splitHousehold(household: IHouseholdCreate, originHouseholdId: uuid, eventId: string): Promise<IHouseholdEntity>;
  moveMembers(firstHousehold: IHouseholdCreate, secondHousehold: IHouseholdCreate): Promise<IHouseholdEntity[]>;
  validateEmail(request: IValidateEmailRequest): Promise<IValidateEmailResponse>;
  makePrimary(id: string, memberId: string, consentInformation: IConsentInformation): Promise<IHouseholdEntity>;
  hasOutstandingPayments(id: uuid): Promise<IOustandingPaymentResponse>;
  getHouseholdActivity(id: uuid): Promise<IHouseholdActivity[]>;
  getHouseholdHistory(id: uuid): Promise<IVersionedEntity[]>;
  getHouseholdMetadataHistory(id: uuid): Promise<IVersionedEntity[]>;
  getMemberHistory(id: uuid): Promise<IVersionedEntity[]>;
  getMemberMetadataHistory(id: uuid): Promise<IVersionedEntity[]>;
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
  addMember: jest.Mock<IHouseholdEntity>;
  splitHousehold: jest.Mock<IHouseholdEntity>;
  moveMembers: jest.Mock<IHouseholdEntity[]>;
  validateEmail: jest.Mock<IValidateEmailResponse>;
  makePrimary: jest.Mock<IHouseholdEntity>;
  hasOutstandingPayments: jest.Mock<IOustandingPaymentResponse>;
  getHouseholdActivity: jest.Mock<IHouseholdActivity[]>;
  getHouseholdHistory: jest.Mock<IVersionedEntity[]>;
  getHouseholdMetadataHistory: jest.Mock<IVersionedEntity[]>;
  getMemberHistory: jest.Mock<IVersionedEntity[]>;
  getMemberMetadataHistory: jest.Mock<IVersionedEntity[]>;
}
