import moment from 'moment';
import { IConsentInformation, IMoveHouseholdRequest } from '@libs/entities-lib/household-create/householdCreate.types';
import { HouseholdStatus, IDetailedRegistrationResponse, IHouseholdEntity, IOustandingPaymentResponse } from '@libs/entities-lib/household';

import {
  IAddressData, IHouseholdCreate, IContactInformation, IContactInformationCreateRequest, ICreateHouseholdRequest,
  IIndigenousCommunityData, IMember, ICurrentAddress, ICurrentAddressCreateRequest, ECurrentAddressTypes,
  MemberCreateRequest, IIdentitySet, IIdentitySetCreateRequest, IMemberEntity, IAddress, IValidateEmailResponse,
  IValidateEmailRequest, ISplitHouseholdRequest, IMemberMoveRequest, IHoneyPotIdentitySet,
  ICheckForPossibleDuplicateResponse, ISendOneTimeCodeRegistrationPublicPayload, IVerifyOneTimeCodeRegistrationPublicPayload,
} from '@libs/entities-lib/household-create';
import { IVersionedEntity } from '@libs/entities-lib/value-objects/versioned-entity/versionedEntity.types';
import { IHouseholdActivity } from '@libs/entities-lib/value-objects/household-activity';
import {
  ECanadaProvinces, ERegistrationMode, IOptionItemData,
} from '@libs/shared-lib/types';
import { DomainBaseService } from '../../base';
import { IHttpClient, IHttpMock } from '../../http-client';
import { IHouseholdsService } from './households.types';

const API_URL_SUFFIX = 'household';
const CONTROLLER = 'households';
const ORCHESTRATION_CONTROLLER = 'orchestration/orchestration-households';

export class HouseholdsService extends DomainBaseService<IHouseholdEntity, uuid> implements IHouseholdsService {
  constructor(http: IHttpClient | IHttpMock) {
    super(http, API_URL_SUFFIX, CONTROLLER);
  }

  async getGenders(): Promise<IOptionItemData[]> {
    return this.http.get<IOptionItemData[]>(`${this.baseApi}/genders/all`);
  }

  async getPreferredLanguages(): Promise<IOptionItemData[]> {
    return this.http.get<IOptionItemData[]>(`${this.baseApi}/preferred-languages`);
  }

  async getPrimarySpokenLanguages(): Promise<IOptionItemData[]> {
    return this.http.get<IOptionItemData[]>(`${this.baseApi}/primary-spoken-languages/all`);
  }

  async getIndigenousCommunities(): Promise<IIndigenousCommunityData[]> {
    return this.http.get(`${API_URL_SUFFIX}/indigenous-communities`);
  }

  async submitRegistration({ household, eventId }: { household: IHouseholdCreate; eventId: string; }):
    Promise<IDetailedRegistrationResponse> {
    const payload = this.parseHouseholdPayload(household, eventId);
    return this.postPublicRegistration(payload);
  }

  async postPublicRegistration(payload: ICreateHouseholdRequest): Promise<IDetailedRegistrationResponse> {
    return this.http.post(`${this.http.baseUrl}/${ORCHESTRATION_CONTROLLER}/public`, { ...payload }, { globalHandler: false });
  }

  async submitCRCRegistration(household: IHouseholdCreate, eventId: string): Promise<IDetailedRegistrationResponse> {
    const payload = this.parseHouseholdPayload(household, eventId);
    return this.postCrcRegistration(payload);
  }

  async postCrcRegistration(payload: ICreateHouseholdRequest): Promise<IDetailedRegistrationResponse> {
    return this.http.post(`${this.http.baseUrl}/${ORCHESTRATION_CONTROLLER}`, payload, { globalHandler: false });
  }

  async getPerson(id: uuid): Promise<IMemberEntity> {
    return this.http.get<IMemberEntity>(`${this.baseApi}/persons/${id}`);
  }

  async updatePersonContactInformation(
    id: string,
    publicMode: boolean,
    payload: { contactInformation: IContactInformation; isPrimaryBeneficiary: boolean; identitySet: IIdentitySet },
): Promise<IMemberEntity> {
    return this.http.patch(`${this.baseApi}/persons/${publicMode ? 'public/' : ''}${id}/contact-information`, {
      isPrimaryBeneficiary: payload.isPrimaryBeneficiary,
      contactInformation: this.parseContactInformation(payload.contactInformation),
      identitySet: this.parseIdentitySet(payload.identitySet),
    });
  }

  async updatePersonIdentity(
    id: string,
    publicMode: boolean,
    payload: { contactInformation: IContactInformation; identitySet: IIdentitySet },
): Promise<IMemberEntity> {
    return this.http.patch(`${this.baseApi}/persons/${publicMode ? 'public/' : ''}${id}/identity-set`, {
      contactInformation: this.parseContactInformation(payload.contactInformation),
      identitySet: this.parseIdentitySet(payload.identitySet),
    });
  }

  async updatePersonAddress(id: string, publicMode: boolean, payload: ICurrentAddress): Promise<IMemberEntity> {
    return this.http.patch(`${this.baseApi}/persons/${publicMode ? 'public/' : ''}${id}/current-address`, {
      currentAddress: this.parseCurrentAddress(payload),
    });
  }

  async updateHomeAddress(id: string, publicMode: boolean, payload: IAddress): Promise<IHouseholdEntity> {
    return this.http.patch(`${this.baseUrl}/${publicMode ? 'public/' : ''}${id}/address`, {
      address: {
        address: this.parseAddress(payload),
        from: moment.utc(moment()).format(),
      },
    });
  }

  async updateNoFixedHomeAddress(id: string, publicMode: boolean, observation?: string): Promise<IHouseholdEntity> {
    return this.http.patch(`${this.baseUrl}/${publicMode ? 'public/' : ''}${id}/no-fixed-address`, {
      from: moment.utc(moment()).format(),
      observation: observation || null,
    });
  }

  async addMember(householdId: string, publicMode: boolean, payload: IMember): Promise<IHouseholdEntity> {
    const parsePayload = this.parseMember(payload);
    return this.http.post(`${this.baseUrl}/${publicMode ? 'public/' : ''}${householdId}/members`, {
      ...parsePayload,
      registrationType: ERegistrationMode.CRC,
    });
  }

  async deleteAdditionalMember(householdId: string, publicMode: boolean, memberId: string): Promise<IHouseholdEntity> {
    return this.http.delete(`${this.baseUrl}/${publicMode ? 'public/' : ''}${householdId}/members/${memberId}`);
  }

  async splitHousehold(household: IHouseholdCreate, originHouseholdId: uuid, eventId: string): Promise<IDetailedRegistrationResponse> {
    const payload = this.parseSplitHouseholdPayload(household, eventId);
    return this.http.patch(`${this.http.baseUrl}/${ORCHESTRATION_CONTROLLER}/${originHouseholdId}/split`, payload, { globalHandler: false });
  }

  async moveMembers(firstHousehold: IHouseholdCreate, secondHousehold: IHouseholdCreate): Promise<IHouseholdEntity[]> {
    const payload = this.parseMovePayload(firstHousehold, secondHousehold);
    // the return value is the 2 modified households
    return this.http.patch(`${this.baseUrl}/move-household-members`, payload);
  }

  async validateEmail(request: IValidateEmailRequest): Promise<IValidateEmailResponse> {
    return this.http.post(`${this.baseApi}/persons/validate-email-address`, request, { globalHandler: false });
  }

  async validatePublicEmail(request: IValidateEmailRequest): Promise<IValidateEmailResponse> {
    return this.http.post(`${this.baseApi}/persons/public/validate-email-address`, request, { globalHandler: false });
  }

  async makePrimary(id: string, memberId: string, consentInformation: IConsentInformation): Promise<IHouseholdEntity> {
    return this.http.post(`${this.baseUrl}/${id}/assign-primary`, { memberId, consentInformation });
  }

  async hasOutstandingPayments(id: uuid): Promise<IOustandingPaymentResponse> {
    return this.http.get(`${this.baseUrl}/${id}/info-outstanding-payments`);
  }

  async getHouseholdActivity(id: uuid): Promise<IHouseholdActivity[]> {
    return this.http.get(`${this.baseUrl}/${id}/activities`);
  }

  async getHouseholdHistory(id: uuid): Promise<IVersionedEntity[]> {
    return this.http.get(`${this.baseUrl}/${id}/history`);
  }

  async getHouseholdMetadataHistory(id: uuid): Promise<IVersionedEntity[]> {
    return this.http.get(`${this.baseUrl}/metadata/${id}/history`);
  }

  async getMemberHistory(id: uuid): Promise<IVersionedEntity[]> {
    return this.http.get(`${this.baseApi}/persons/${id}/history`);
  }

  async getMemberMetadataHistory(id: uuid): Promise<IVersionedEntity[]> {
    return this.http.get(`${this.baseApi}/persons/metadata/${id}/history`);
  }

  publicGetHousehold(id: uuid): Promise<IHouseholdEntity> {
    return this.http.get(`${this.baseUrl}/public/${id}`);
  }

  publicGetPerson(id: uuid): Promise<IMemberEntity> {
    return this.http.get(`${this.baseApi}/persons/public/${id}`);
  }

  checkForPossibleDuplicatePublic(eventId: string, member: IMember): Promise<ICheckForPossibleDuplicateResponse> {
    return this.http.post(
      `${this.baseApi}/persons/public/check-possible-duplicate`,
      { eventId, contactInformation: member.contactInformation, identitySet: member.identitySet },
      { globalHandler: false },
    );
  }

  async getPublicToken(recaptchaToken: string): Promise<string> {
    const publicToken = await this.http.post<string>(
      `${this.baseApi}/persons/public/validate-recaptcha?recaptchaToken=${encodeURIComponent(recaptchaToken)}`,
      null,
      { globalHandler: false },
    );

    this.http.setPublicToken(publicToken);

    return publicToken;
  }

  sendOneTimeCodeRegistrationPublic(payload: ISendOneTimeCodeRegistrationPublicPayload): Promise<void> {
    return this.http.post(`${this.baseApi}/persons/public/send-code-registration`, payload, { globalHandler: false });
  }

  async verifyOneTimeCodeRegistrationPublic(payload: IVerifyOneTimeCodeRegistrationPublicPayload): Promise<boolean> {
    const publicToken = await this.http.post<string>(`${this.baseApi}/persons/public/verify-code-registration`, payload, { globalHandler: false });
    const success = publicToken !== null && publicToken !== '';
    if (success) {
      this.http.setPublicToken(publicToken);
    }
    return success;
  }

  /** Private methods * */

  parseSplitHouseholdPayload(household: IHouseholdCreate, eventId: string): ISplitHouseholdRequest {
    const householdPayload = this.parseHouseholdPayload(household, eventId);
    // Remove field additionalMembers from the household payload object
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { additionalMembers, ...splitPayload } = householdPayload;
    return {
      ...splitPayload,
      primaryBeneficiaryId: household.primaryBeneficiary.id,
      additionalMemberIds: household.additionalMembers.map((member) => member.id),
      registrationType: ERegistrationMode.CRC,
    };
  }

  parseMovePayload(firstHousehold: IHouseholdCreate, secondHousehold: IHouseholdCreate): IMoveHouseholdRequest {
    return {
      firstHouseholdId: firstHousehold.id,
      firstHouseholdMembers: !firstHousehold.primaryBeneficiary ? [] : [
        this.parseMoveMember(firstHousehold.primaryBeneficiary, true),
        ...firstHousehold.additionalMembers.map((m) => this.parseMoveMember(m, false)),
      ],
      secondHouseholdId: secondHousehold.id,
      secondHouseholdMembers: !secondHousehold.primaryBeneficiary ? [] : [
        this.parseMoveMember(secondHousehold.primaryBeneficiary, true),
        ...secondHousehold.additionalMembers.map((m) => this.parseMoveMember(m, false)),
      ],
    };
  }

  parseHouseholdPayload(household: IHouseholdCreate, eventId: string): ICreateHouseholdRequest {
    return {
      noFixedHome: household.noFixedHome,
      primaryBeneficiary: this.parseMember(household.primaryBeneficiary),
      additionalMembers: household.additionalMembers.map((member) => this.parseAdditionalMember(member)),
      homeAddress: household.noFixedHome ? null : this.parseAddress(household.homeAddress),
      eventId,
      consentInformation: household.consentInformation,
      // name is honey pot - it should always be null...
      name: (household.primaryBeneficiary.identitySet as IHoneyPotIdentitySet).name,
    };
  }

  parseMember(member: IMember): MemberCreateRequest {
    return {
      identitySet: this.parseIdentitySet(member.identitySet),
      currentAddress: this.parseCurrentAddress(member.currentAddress),
      contactInformation: this.parseContactInformation(member.contactInformation),
    };
  }

  parseAdditionalMember(member: IMember): MemberCreateRequest {
    return {
      identitySet: this.parseIdentitySet(member.identitySet),
      currentAddress: this.parseCurrentAddress(member.currentAddress),
      contactInformation: null,
    };
  }

  parseCurrentAddress(currentAddress: ICurrentAddress): ICurrentAddressCreateRequest {
    const noPlaceAddress = currentAddress.addressType === ECurrentAddressTypes.RemainingInHome
      || currentAddress.addressType === ECurrentAddressTypes.Other
      || currentAddress.addressType === ECurrentAddressTypes.Shelter
      || currentAddress.addressType === ECurrentAddressTypes.Unknown;

    return {
      addressType: currentAddress.addressType,
      placeNumber: currentAddress.placeNumber,
      placeName: currentAddress.placeName,
      shelterLocationId: currentAddress.shelterLocation ? currentAddress.shelterLocation.id : null,
      address: noPlaceAddress ? null : this.parseAddress(currentAddress.address),
      from: moment.utc(moment()).format(),
    };
  }

  parseAddress(address: IAddressData): IAddressData {
    return {
      country: address.country,
      streetAddress: address.streetAddress,
      unitSuite: address.unitSuite ? address.unitSuite : null,
      province: address.province ?? ECanadaProvinces.OT,
      specifiedOtherProvince: address.specifiedOtherProvince,
      city: address.city,
      postalCode: address.postalCode,
      latitude: address.latitude,
      longitude: address.longitude,
    };
  }

  parseContactInformation(contactInformation: IContactInformation): IContactInformationCreateRequest {
    return {
      homePhoneNumber: contactInformation?.homePhoneNumber?.number ? contactInformation.homePhoneNumber : null,
      mobilePhoneNumber: contactInformation?.mobilePhoneNumber?.number ? contactInformation.mobilePhoneNumber : null,
      alternatePhoneNumber: contactInformation?.alternatePhoneNumber?.number ? contactInformation.alternatePhoneNumber : null,
      email: contactInformation?.email ? contactInformation.email : null,
      preferredLanguage: contactInformation?.preferredLanguage ? {
        optionItemId: contactInformation?.preferredLanguage?.id,
        specifiedOther: contactInformation?.preferredLanguage?.isOther ? contactInformation.preferredLanguageOther : null,
      } : null,
      primarySpokenLanguage: contactInformation?.primarySpokenLanguage ? {
        optionItemId: contactInformation.primarySpokenLanguage.id,
        specifiedOther: contactInformation.primarySpokenLanguage.isOther ? contactInformation.primarySpokenLanguageOther : null,
      } : null,
    };
  }

  parseIdentitySet(identitySet: IIdentitySet): IIdentitySetCreateRequest {
    let { indigenousIdentity } = identitySet;
    if (identitySet?.indigenousIdentity?.indigenousCommunityId === undefined) {
      indigenousIdentity = null;
    }
    return {
      firstName: identitySet?.firstName,
      middleName: identitySet?.middleName,
      lastName: identitySet?.lastName,
      preferredName: identitySet?.preferredName,
      dateOfBirth: identitySet?.dateOfBirth,
      gender: {
        optionItemId: identitySet?.gender.id,
        specifiedOther: identitySet?.gender?.isOther ? identitySet.genderOther : null,
      },
      indigenousIdentity,
    };
  }

  parseMoveMember(member: IMember, isPrimaryBeneficiary: boolean): IMemberMoveRequest {
    if (!member) {
      return null;
    }
    return {
      isPrimaryBeneficiary,
      preferredLanguageId: member.contactInformation.preferredLanguage?.id,
      memberId: member.id,
      currentAddress: this.parseCurrentAddress(member.currentAddress),
      identitySet: isPrimaryBeneficiary ? this.parseIdentitySet(member.identitySet) : null,
    };
  }

  async setHouseholdStatus(householdId: string, status: HouseholdStatus, rationale: string): Promise<IHouseholdEntity> {
    switch (status) {
      case HouseholdStatus.Open:
        return this.http.patch(`${this.baseUrl}/${householdId}/reopen/`, { rationale });
      case HouseholdStatus.Archived:
        return this.http.patch(`${this.baseUrl}/${householdId}/archive/`, { rationale });
      case HouseholdStatus.Closed:
        return this.http.patch(`${this.baseUrl}/${householdId}/close/`, { rationale });
      default:
        return null;
    }
  }
}
