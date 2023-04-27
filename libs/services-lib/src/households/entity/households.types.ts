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
  ICheckForPossibleDuplicateResponse,
  ISendOneTimeCodeRegistrationPublicPayload,
  IVerifyOneTimeCodeRegistrationPublicPayload,
  ICreateHouseholdRequest,
} from '@libs/entities-lib/household-create';
import {
  HouseholdStatus,
  IDetailedRegistrationResponse, IdParams, IDuplicateData, IHouseholdEntity, IOustandingPaymentResponse,
} from '@libs/entities-lib/household';
import { IVersionedEntity } from '@libs/entities-lib/value-objects/versioned-entity';
import { IHouseholdActivity } from '@libs/entities-lib/value-objects/household-activity';
import { IOptionItemData } from '@libs/shared-lib/types';
import { IDomainBaseService, IDomainBaseServiceMock } from '../../base';

export interface IHouseholdsService extends IDomainBaseService<IHouseholdEntity, IdParams> {
  getGenders(): Promise<IOptionItemData[]>;
  getPreferredLanguages(): Promise<IOptionItemData[]>;
  getPrimarySpokenLanguages(): Promise<IOptionItemData[]>;
  getIndigenousCommunities(): Promise<IIndigenousCommunityData[]>;
  getPerson(id: uuid): Promise<IMemberEntity>;
  submitRegistration({ household, eventId }: { household: IHouseholdCreate; eventId: string; }): Promise<IDetailedRegistrationResponse>;
  postPublicRegistration(payload: ICreateHouseholdRequest): Promise<IDetailedRegistrationResponse>
  submitCRCRegistration(household: IHouseholdCreate, eventId: string): Promise<IDetailedRegistrationResponse>;
  postCrcRegistration(payload: ICreateHouseholdRequest): Promise<IDetailedRegistrationResponse>
  updatePersonContactInformation(id: string,
      publicMode: boolean,
      payload: { contactInformation: IContactInformation; isPrimaryBeneficiary: boolean; identitySet: IIdentitySet }): Promise<IMemberEntity> | false;
  updatePersonIdentity(id: string,
      publicMode: boolean,
      payload: { contactInformation: IContactInformation; identitySet: IIdentitySet }): Promise<IMemberEntity> | false;
  updatePersonAddress(id: string, publicMode: boolean, payload: ICurrentAddress): Promise<IMemberEntity> | false;
  updateHomeAddress(id: string, publicMode: boolean, payload: IAddress): Promise<IHouseholdEntity> | false;
  updateNoFixedHomeAddress(id: string, publicMode: boolean, observation?: string): Promise<IHouseholdEntity> | false;
  deleteAdditionalMember(householdId: string, publicMode: boolean, memberId: string): Promise<IHouseholdEntity>;
  addMember(householdId: string, publicMode: boolean, payload: IMember): Promise<IHouseholdEntity>;
  splitHousehold(household: IHouseholdCreate, originHouseholdId: uuid, eventId: string): Promise<IDetailedRegistrationResponse>;
  moveMembers(firstHousehold: IHouseholdCreate, secondHousehold: IHouseholdCreate): Promise<IHouseholdEntity[]>;
  validateEmail(request: IValidateEmailRequest): Promise<IValidateEmailResponse>;
  validatePublicEmail(request: IValidateEmailRequest): Promise<IValidateEmailResponse>;
  makePrimary(id: string, memberId: string, consentInformation: IConsentInformation): Promise<IHouseholdEntity>;
  hasOutstandingPayments(id: uuid): Promise<IOustandingPaymentResponse>;
  getHouseholdActivity(id: uuid): Promise<IHouseholdActivity[]>;
  getHouseholdHistory(id: uuid): Promise<IVersionedEntity[]>;
  getHouseholdMetadataHistory(id: uuid): Promise<IVersionedEntity[]>;
  getMemberHistory(id: uuid): Promise<IVersionedEntity[]>;
  getMemberMetadataHistory(id: uuid): Promise<IVersionedEntity[]>;
  getDuplicates(id: uuid): Promise<IDuplicateData[]>;
  setHouseholdStatus(householdId: string, status: HouseholdStatus, rationale: string): Promise<IHouseholdEntity>;
  checkForPossibleDuplicatePublic(eventId: uuid, member: IMember): Promise<ICheckForPossibleDuplicateResponse>;
  sendOneTimeCodeRegistrationPublic(payload: ISendOneTimeCodeRegistrationPublicPayload): Promise<void>;
  verifyOneTimeCodeRegistrationPublic(payload: IVerifyOneTimeCodeRegistrationPublicPayload): Promise<boolean>;
  getPublicToken(recaptchaToken: string): Promise<string>;
  publicGetHousehold(id: uuid): Promise<IHouseholdEntity>;
  publicGetPerson(id: uuid): Promise<IMemberEntity>;
}

export interface IHouseholdsServiceMock extends IDomainBaseServiceMock<IHouseholdEntity> {
  getGenders: jest.Mock<IOptionItemData[]>;
  getPreferredLanguages: jest.Mock<IOptionItemData[]>;
  getPrimarySpokenLanguages: jest.Mock<IOptionItemData[]>;
  getIndigenousCommunities: jest.Mock<IIndigenousCommunityData[]>;
  submitRegistration: jest.Mock<IDetailedRegistrationResponse>;
  postPublicRegistration: jest.Mock<IDetailedRegistrationResponse>;
  getPerson: jest.Mock<IMemberEntity>;
  submitCRCRegistration: jest.Mock<IDetailedRegistrationResponse>;
  postCRCRegistration: jest.Mock<IDetailedRegistrationResponse>;
  updatePersonContactInformation: jest.Mock<IMemberEntity>;
  updatePersonIdentity: jest.Mock<IMemberEntity>;
  updatePersonAddress: jest.Mock<IMemberEntity>;
  updateHomeAddress: jest.Mock<IHouseholdEntity>;
  updateNoFixedHomeAddress: jest.Mock<IHouseholdEntity>;
  deleteAdditionalMember: jest.Mock<IHouseholdEntity>;
  addMember: jest.Mock<IHouseholdEntity>;
  splitHousehold: jest.Mock<IDetailedRegistrationResponse>;
  moveMembers: jest.Mock<IHouseholdEntity[]>;
  validateEmail: jest.Mock<IValidateEmailResponse>;
  validatePublicEmail: jest.Mock<IValidateEmailResponse>;
  makePrimary: jest.Mock<IHouseholdEntity>;
  hasOutstandingPayments: jest.Mock<IOustandingPaymentResponse>;
  getHouseholdActivity: jest.Mock<IHouseholdActivity[]>;
  getHouseholdHistory: jest.Mock<IVersionedEntity[]>;
  getHouseholdMetadataHistory: jest.Mock<IVersionedEntity[]>;
  getMemberHistory: jest.Mock<IVersionedEntity[]>;
  getMemberMetadataHistory: jest.Mock<IVersionedEntity[]>;
  setHouseholdStatus: jest.Mock<IHouseholdEntity>;
  checkForPossibleDuplicatePublic: jest.Mock<ICheckForPossibleDuplicateResponse>;
  sendOneTimeCodeRegistrationPublic: jest.Mock<void>;
  verifyOneTimeCodeRegistrationPublic: jest.Mock<boolean>;
  getPublicToken: jest.Mock<string>;
  getDuplicates: jest.Mock<IDuplicateData[]>;
  publicGetHousehold: jest.Mock<IHouseholdEntity>;
  publicGetPerson: jest.Mock<IMemberEntity>;
}
