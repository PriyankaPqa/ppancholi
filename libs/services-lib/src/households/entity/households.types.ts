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
  IValidateEmailPublicRequest,
  ICheckForPossibleDuplicateResponse,
  ISendOneTimeCodeRegistrationPublicPayload,
  IVerifyOneTimeCodeRegistrationPublicPayload,
  ICreateHouseholdRequest,
} from '@libs/entities-lib/household-create';
import {
 IDetailedRegistrationResponse, IdParams, IHouseholdEntity, IOustandingPaymentResponse,
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
  submitRegistration({ household, eventId, recaptchaToken }: { household: IHouseholdCreate; eventId: string; recaptchaToken: string }): Promise<IDetailedRegistrationResponse>;
  postPublicRegistration(payload: ICreateHouseholdRequest, recaptchaToken: string): Promise<IDetailedRegistrationResponse>
  submitCRCRegistration(household: IHouseholdCreate, eventId: string): Promise<IDetailedRegistrationResponse>;
  postCrcRegistration(payload: ICreateHouseholdRequest): Promise<IDetailedRegistrationResponse>
  updatePersonContactInformation(id: string,
      payload: { contactInformation: IContactInformation; isPrimaryBeneficiary: boolean; identitySet: IIdentitySet }): Promise<IHouseholdEntity> | false;
  updatePersonIdentity(id: string,
    payload: { contactInformation: IContactInformation; identitySet: IIdentitySet }): Promise<IHouseholdEntity> | false;
  updatePersonAddress(id: string, payload: ICurrentAddress): Promise<IHouseholdEntity> | false;
  updateHomeAddress(id: string, payload: IAddress): Promise<IHouseholdEntity> | false;
  updateNoFixedHomeAddress(id: string, observation?: string): Promise<IHouseholdEntity> | false;
  deleteAdditionalMember(householdId: string, memberId: string): Promise<IHouseholdEntity>;
  addMember(householdId: string, payload: IMember): Promise<IHouseholdEntity>;
  splitHousehold(household: IHouseholdCreate, originHouseholdId: uuid, eventId: string): Promise<IDetailedRegistrationResponse>;
  moveMembers(firstHousehold: IHouseholdCreate, secondHousehold: IHouseholdCreate): Promise<IHouseholdEntity[]>;
  validateEmail(request: IValidateEmailRequest): Promise<IValidateEmailResponse>;
  validatePublicEmail(request: IValidateEmailPublicRequest): Promise<IValidateEmailResponse>;
  makePrimary(id: string, memberId: string, consentInformation: IConsentInformation): Promise<IHouseholdEntity>;
  hasOutstandingPayments(id: uuid): Promise<IOustandingPaymentResponse>;
  getHouseholdActivity(id: uuid): Promise<IHouseholdActivity[]>;
  getHouseholdHistory(id: uuid): Promise<IVersionedEntity[]>;
  getHouseholdMetadataHistory(id: uuid): Promise<IVersionedEntity[]>;
  getMemberHistory(id: uuid): Promise<IVersionedEntity[]>;
  getMemberMetadataHistory(id: uuid): Promise<IVersionedEntity[]>;
  checkForPossibleDuplicatePublic(eventId: uuid, member: IMember, recaptchaToken: string): Promise<ICheckForPossibleDuplicateResponse>;
  sendOneTimeCodeRegistrationPublic(payload: ISendOneTimeCodeRegistrationPublicPayload): Promise<void>;
  verifyOneTimeCodeRegistrationPublic(payload: IVerifyOneTimeCodeRegistrationPublicPayload): Promise<boolean>;
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
  updatePersonContactInformation: jest.Mock<IHouseholdEntity>;
  updatePersonIdentity: jest.Mock<IHouseholdEntity>;
  updatePersonAddress: jest.Mock<IHouseholdEntity>;
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
  checkForPossibleDuplicatePublic: jest.Mock<ICheckForPossibleDuplicateResponse>;
  sendOneTimeCodeRegistrationPublic: jest.Mock<void>;
  verifyOneTimeCodeRegistrationPublic: jest.Mock<boolean>;
}
