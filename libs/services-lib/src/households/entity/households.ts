import { utcToZonedTime, format } from 'date-fns-tz';
import { IConsentInformation, IMoveHouseholdRequest, ISelfRegistrationLog } from '@libs/entities-lib/household-create/householdCreate.types';
import { HouseholdStatus, IDetailedRegistrationResponse, IHouseholdEntity, IOustandingPaymentResponse } from '@libs/entities-lib/household';
import {
  IHouseholdCreate, IContactInformation, IContactInformationCreateRequest, ICreateHouseholdRequest,
  IIndigenousCommunityData, IMember, ICurrentAddress,
  MemberCreateRequest, IIdentitySet, IIdentitySetCreateRequest, IMemberEntity, IAddress, IValidateEmailResponse,
  IValidateEmailRequest, ISplitHouseholdRequest, IMemberMoveRequest, IHoneyPotIdentitySet,
  ICheckForPossibleDuplicateResponse, ISendOneTimeCodeRegistrationPublicPayload, IVerifyOneTimeCodeRegistrationPublicPayload,
  CurrentAddress,
  ECurrentAddressTypes,
  ICurrentAddressCreateRequest,
} from '@libs/entities-lib/household-create';
import { ICaseFileIndividualCreateRequest, MembershipStatus } from '@libs/entities-lib/case-file-individual';

import { IHouseholdActivity } from '@libs/entities-lib/value-objects/household-activity';
import {
  ERegistrationMode, ICombinedSearchResult, ISearchParams, IOptionItemData,
} from '@libs/shared-lib/types';
import { DomainBaseService } from '../../base';
import { GlobalHandler, IHttpClient, IHttpMock } from '../../http-client';
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

  async submitRegistration({ household, eventId, selfRegistrationLog }:
        { household: IHouseholdCreate; eventId: string; selfRegistrationLog: ISelfRegistrationLog }):
  Promise<IDetailedRegistrationResponse> {
    const payload = this.parseHouseholdPayload(household, eventId, selfRegistrationLog);
    return this.postPublicRegistration(payload);
  }

  async postPublicRegistration(payload: ICreateHouseholdRequest): Promise<IDetailedRegistrationResponse> {
    return this.http.post(`${this.http.baseUrl}/${ORCHESTRATION_CONTROLLER}/public`, { ...payload }, { globalHandler: GlobalHandler.Partial });
  }

  async submitCRCRegistration(household: IHouseholdCreate, eventId: string): Promise<IDetailedRegistrationResponse> {
    const payload = this.parseHouseholdPayload(household, eventId);
    return this.postCrcRegistration(payload);
  }

  async postCrcRegistration(payload: ICreateHouseholdRequest): Promise<IDetailedRegistrationResponse> {
    return this.http.post(`${this.http.baseUrl}/${ORCHESTRATION_CONTROLLER}`, payload, { globalHandler: GlobalHandler.Partial });
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
    const url = publicMode ? `${this.baseApi}/persons/public/${id}/identity-set`
      : `${this.http.baseUrl}/${ORCHESTRATION_CONTROLLER}/${id}/identity-set`;
    return this.http.patch(url, {
      contactInformation: this.parseContactInformation(payload.contactInformation),
      identitySet: this.parseIdentitySet(payload.identitySet),
    });
  }

  async updatePersonAddress(id: string, publicMode: boolean, payload: ICurrentAddress): Promise<IMemberEntity> {
    return this.http.patch(`${this.baseApi}/persons/${publicMode ? 'public/' : ''}${id}/current-address`, {
      currentAddress: CurrentAddress.parseCurrentAddress(payload),
    });
  }

  async updateHomeAddress(id: string, publicMode: boolean, payload: IAddress): Promise<IHouseholdEntity> {
    const url = publicMode ? `${this.baseUrl}/public/${id}/address`
      : `${this.http.baseUrl}/${ORCHESTRATION_CONTROLLER}/${id}/address`;
    return this.http.patch(url, {
      address: {
        address: CurrentAddress.parseAddress(payload),
        from: format(utcToZonedTime(new Date(), 'UTC'), "yyyy-MM-dd'T'HH:mm:ss'Z'", { timeZone: 'UTC' }),
      },
    });
  }

  async updateNoFixedHomeAddress(id: string, publicMode: boolean, observation?: string): Promise<IHouseholdEntity> {
    const url = publicMode ? `${this.baseUrl}/public/${id}/no-fixed-address` : `${this.http.baseUrl}/${ORCHESTRATION_CONTROLLER}/${id}/no-fixed-address`;
    return this.http.patch(url, {
      from: format(utcToZonedTime(new Date(), 'UTC'), "yyyy-MM-dd'T'HH:mm:ss'Z'", { timeZone: 'UTC' }),
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

  async addMemberV2(householdId: string, publicMode: boolean, payload: IMember, sameAddress: boolean): Promise<IHouseholdEntity> {
    const parsePayload = this.parseMember(payload);
    // useless eventually
    parsePayload.currentAddress = { addressType: ECurrentAddressTypes.Unknown } as ICurrentAddressCreateRequest;
    return this.http.post(`${this.http.baseUrl}/${ORCHESTRATION_CONTROLLER}/${publicMode ? 'public/' : ''}${householdId}/members`, {
      ...parsePayload,
      registrationType: ERegistrationMode.CRC,
      sameTemporaryAddressAsPrimary: sameAddress,
    });
  }

  async deleteAdditionalMember(householdId: string, publicMode: boolean, memberId: string): Promise<IHouseholdEntity> {
    return this.http.delete(`${this.baseUrl}/${publicMode ? 'public/' : ''}${householdId}/members/${memberId}`);
  }

  async splitHousehold(household: IHouseholdCreate, originHouseholdId: uuid, eventId: string): Promise<IDetailedRegistrationResponse> {
    const payload = this.parseSplitHouseholdPayload(household, eventId);
    return this.http.patch(`${this.http.baseUrl}/${ORCHESTRATION_CONTROLLER}/${originHouseholdId}/split`, payload, { globalHandler: GlobalHandler.Partial });
  }

  async moveMembers(firstHousehold: IHouseholdCreate, secondHousehold: IHouseholdCreate): Promise<IHouseholdEntity[]> {
    const payload = this.parseMovePayload(firstHousehold, secondHousehold);
    // the return value is the 2 modified households
    return this.http.patch(`${this.baseUrl}/move-household-members`, payload);
  }

  async moveMembersV2(firstHousehold: IHouseholdCreate, secondHousehold: IHouseholdCreate): Promise<IHouseholdEntity[]> {
    const payload = this.parseMovePayload(firstHousehold, secondHousehold);
    // the return value is the 2 modified households
    return this.http.patch(`${this.http.baseUrl}/${ORCHESTRATION_CONTROLLER}/move-household-members`, payload);
  }

  async validateEmail(request: IValidateEmailRequest): Promise<IValidateEmailResponse> {
    return this.http.post(`${this.baseApi}/persons/validate-email-address`, request, { globalHandler: GlobalHandler.Partial });
  }

  async validatePublicEmail(request: IValidateEmailRequest): Promise<IValidateEmailResponse> {
    return this.http.post(`${this.baseApi}/persons/public/validate-email-address`, request, { globalHandler: GlobalHandler.Partial });
  }

  async makePrimary(id: string, memberId: string, consentInformation: IConsentInformation): Promise<IHouseholdEntity> {
    return this.http.post(`${this.http.baseUrl}/${ORCHESTRATION_CONTROLLER}/${id}/assign-primary`, { memberId, consentInformation });
  }

  async hasOutstandingPayments(id: uuid): Promise<IOustandingPaymentResponse> {
    return this.http.get(`${this.baseUrl}/${id}/info-outstanding-payments`);
  }

  async getHouseholdActivity(id: uuid): Promise<IHouseholdActivity[]> {
    return this.http.get(`${this.baseUrl}/${id}/activities`);
  }

  // eslint-disable-next-line
  async search(params: ISearchParams & { includePrimary?: boolean, includeMembers?: boolean }, searchEndpoint: string = null, includePrimary: boolean = false, includeMembers: boolean = false)
  : Promise<ICombinedSearchResult<IHouseholdEntity, null>> {
    return this.http.get(
      `${this.apiUrlSuffix}/search/householdsV2?includePrimary=${params.includePrimary || includePrimary}&includeMembers=${params.includeMembers || includeMembers}`,
      { params, isOData: true },
    );
  }

  publicGetHousehold(id: uuid): Promise<IHouseholdEntity> {
    return this.http.get(`${this.baseUrl}/public/${id}`);
  }

  publicGetPerson(id: uuid): Promise<IMemberEntity> {
    return this.http.get(`${this.baseApi}/persons/public/${id}`);
  }

  checkForPossibleDuplicatePublic(eventId: string, member: IMember, householdId: uuid = null): Promise<ICheckForPossibleDuplicateResponse> {
    return this.http.post(
      `${this.baseApi}/persons/public/check-possible-duplicate`,
      { eventId, contactInformation: member.contactInformation, identitySet: member.identitySet, householdId },
      { globalHandler: GlobalHandler.Partial },
    );
  }

  async getPublicToken(recaptchaToken: string): Promise<string> {
    const publicToken = await this.http.post<string>(
      `${this.baseApi}/persons/public/validate-recaptcha`,
      { recaptchaToken },
      { globalHandler: GlobalHandler.Partial },
    );

    this.http.setPublicToken(publicToken);

    return publicToken;
  }

  sendOneTimeCodeRegistrationPublic(payload: ISendOneTimeCodeRegistrationPublicPayload): Promise<void> {
    return this.http.post(`${this.baseApi}/persons/public/send-code-registration`, payload, { globalHandler: GlobalHandler.Partial });
  }

  async verifyOneTimeCodeRegistrationPublic(payload: IVerifyOneTimeCodeRegistrationPublicPayload): Promise<boolean> {
    const publicToken = await this.http.post<string>(`${this.baseApi}/persons/public/verify-code-registration`, payload, { globalHandler: GlobalHandler.Partial });
    const success = publicToken !== null && publicToken !== '';
    if (success) {
      this.http.setPublicToken(publicToken);
    }
    return success;
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
      individuals: [household.primaryBeneficiary, ...household.additionalMembers].filter((m) => m).map((m) => ({
        personId: m.id,
        temporaryAddressHistory: [CurrentAddress.parseCurrentAddress(m.currentAddress)],
        receivingAssistanceDetails: [{ receivingAssistance: true }],
        membershipStatus: MembershipStatus.Active,
      }) as ICaseFileIndividualCreateRequest),
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

  parseHouseholdPayload(household: IHouseholdCreate, eventId: string, selfRegistrationLog?: ISelfRegistrationLog): ICreateHouseholdRequest {
    return {
      noFixedHome: household.noFixedHome,
      primaryBeneficiary: this.parseMember(household.primaryBeneficiary),
      additionalMembers: household.additionalMembers.map((member) => this.parseAdditionalMember(member)),
      homeAddress: household.noFixedHome ? null : CurrentAddress.parseAddress(household.homeAddress),
      eventId,
      consentInformation: household.consentInformation,
      // name is honey pot - it should always be null...
      name: (household.primaryBeneficiary.identitySet as IHoneyPotIdentitySet).name,
      selfRegistrationLog,
    };
  }

  parseMember(member: IMember): MemberCreateRequest {
    return {
      identitySet: this.parseIdentitySet(member.identitySet),
      currentAddress: CurrentAddress.parseCurrentAddress(member.currentAddress),
      contactInformation: this.parseContactInformation(member.contactInformation),
    };
  }

  parseAdditionalMember(member: IMember): MemberCreateRequest {
    return {
      identitySet: this.parseIdentitySet(member.identitySet),
      currentAddress: CurrentAddress.parseCurrentAddress(member.currentAddress),
      contactInformation: null,
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
      currentAddress: CurrentAddress.parseCurrentAddress(member.currentAddress),
      identitySet: isPrimaryBeneficiary ? this.parseIdentitySet(member.identitySet) : null,
      sameTemporaryAddressAsPrimary: member.sameTemporaryAddressAsPrimary || false,
    };
  }
}
