import moment from 'moment';
import { IHttpClient } from '../../httpClient';
import { IHouseholdEntity } from '../../../entities/household';
import {
  ECanadaProvinces, ERegistrationMode, IOptionItemData,
} from '../../../types';
import {
  IAddressData,
  IHouseholdCreate,
  IContactInformation,
  IContactInformationCreateRequest,
  ICreateHouseholdRequest,
  IIndigenousCommunityData,
  IMember,
  ICurrentAddress,
  ICurrentAddressCreateRequest,
  ECurrentAddressTypes,
  MemberCreateRequest,
  IIdentitySet,
  IIdentitySetCreateRequest,
  IMemberData, IAddress, IValidateEmailResponse, IValidateEmailRequest,
} from '../../../entities/household-create';
import { IHouseholdsService } from './households.types';
import { DomainBaseService } from '../../base';

const API_URL_SUFFIX = 'household';
const CONTROLLER = 'households';

export class HouseholdsService extends DomainBaseService<IHouseholdEntity> implements IHouseholdsService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, CONTROLLER);
  }

  async getGenders(): Promise<IOptionItemData[]> {
    return this.http.get<IOptionItemData[]>(`${this.baseApi}/genders`);
  }

  async getPreferredLanguages(): Promise<IOptionItemData[]> {
    return this.http.get<IOptionItemData[]>(`${this.baseApi}/preferred-languages`);
  }

  async getPrimarySpokenLanguages(): Promise<IOptionItemData[]> {
    return this.http.get<IOptionItemData[]>(`${this.baseApi}/primary-spoken-languages`);
  }

  async getIndigenousCommunities(): Promise<IIndigenousCommunityData[]> {
    return this.http.get(`${API_URL_SUFFIX}/indigenous-communities`);
  }

  async submitRegistration(household: IHouseholdCreate, eventId: string): Promise<IHouseholdEntity> {
    const payload = this.parseHouseholdPayload(household, eventId);
    return this.http.post(`${this.baseUrl}/public`, payload, { globalHandler: false });
  }

  async submitCRCRegistration(household: IHouseholdCreate, eventId: string): Promise<IHouseholdEntity> {
    const payload = this.parseHouseholdPayload(household, eventId);
    return this.http.post(`${this.baseUrl}`, payload, { globalHandler: false });
  }

  async getPerson(id: uuid): Promise<IMemberData> {
    return this.http.get<IMemberData>(`${this.baseApi}/persons/${id}`);
  }

  async updatePersonContactInformation(id: string, payload: IContactInformation): Promise<IHouseholdEntity> {
    return this.http.patch(`${this.baseApi}/persons/${id}/contact-information`, {
      contactInformation: this.parseContactInformation(payload),
    });
  }

  async updatePersonIdentity(id: string, payload: IIdentitySet): Promise<IHouseholdEntity> {
    return this.http.patch(`${this.baseApi}/persons/${id}/identity-set`, {
      identitySet: this.parseIdentitySet(payload),
    });
  }

  async updatePersonAddress(id: string, payload: ICurrentAddress): Promise<IHouseholdEntity> {
    return this.http.patch(`${this.baseApi}/persons/${id}/current-address`, {
      currentAddress: this.parseCurrentAddress(payload),
    });
  }

  async updateHomeAddress(id: string, payload: IAddress): Promise<IHouseholdEntity> {
    return this.http.patch(`${this.baseUrl}/${id}/address`, {
      address: {
        address: this.parseAddress(payload),
        from: moment.utc(moment()).format(),
      },
    });
  }

  async updateNoFixedHomeAddress(id: string, observation?: string): Promise<IHouseholdEntity> {
    return this.http.patch(`${this.baseUrl}/${id}/no-fixed-address`, {
      from: moment.utc(moment()).format(),
      observation: observation || null,
    });
  }

  async deleteAdditionalMember(householdId: string, memberId: string): Promise<IHouseholdEntity> {
    return this.http.delete(`${this.baseUrl}/${householdId}/members/${memberId}`);
  }

  // async splitMembers(householdId: string, memberIds: string[]): Promise<IHouseholdEntity> {
  //   return this.http.patch(`${this.baseUrl}/${householdId}/split`, memberIds);
  // }

  async addMember(householdId: string, payload: IMember): Promise<IHouseholdEntity> {
    const parsePayload = this.parseMember(payload);
    return this.http.post(`${this.baseUrl}/${householdId}/members`, {
      ...parsePayload,
      registrationType: ERegistrationMode.CRC,
    });
  }

  async validateEmail(request: IValidateEmailRequest): Promise<IValidateEmailResponse> {
    return this.http.post(`${API_URL_SUFFIX}/persons/validate-email-address`, request);
  }

  parseHouseholdPayload(household: IHouseholdCreate, eventId: string): ICreateHouseholdRequest {
    return {
      noFixedHome: household.noFixedHome,
      primaryBeneficiary: this.parseMember(household.primaryBeneficiary),
      additionalMembers: household.additionalMembers.map((member) => this.parseAdditionalMember(member)),
      homeAddress: household.noFixedHome ? null : this.parseAddress(household.homeAddress),
      eventId,
      consentInformation: household.consentInformation,
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
      unitSuite: address.unitSuite,
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
}
