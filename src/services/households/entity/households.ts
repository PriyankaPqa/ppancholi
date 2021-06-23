import { IHttpClient } from '../../../services/httpClient';
import moment from 'moment';
import { IHouseholdEntity } from '../../../entities/household';
import {
  ECanadaProvinces, IAzureSearchParams, IAzureSearchResult, IOptionItemData,
} from '../../../types';
import {
  IAddressData,
  IHouseholdCreate,
  IContactInformation,
  IContactInformationCreateRequest,
  ICreateHouseholdRequest,
  IIndigenousIdentityData,
  IMember,
  ICurrentAddress,
  ICurrentAddressCreateRequest, ECurrentAddressTypes, MemberCreateRequest, IIdentitySet, IIdentitySetCreateRequest, IIndigenousIdentityOption,
} from '../../../entities/household-create';
import { IHouseholdsService } from './households.types';
import { DomainBaseService } from '../../base';

const API_URL_SUFFIX = 'household';
const CONTROLLER = 'households';

export class HouseholdsService extends DomainBaseService<IHouseholdEntity> implements IHouseholdsService {
  constructor(http: IHttpClient) {
    super(http, API_URL_SUFFIX, CONTROLLER);
  }

  getGenders(): Promise<IOptionItemData[]> {
    return this.http.get<IOptionItemData[]>(`${this.baseApi}/genders`);
  }

  getPreferredLanguages(): Promise<IOptionItemData[]> {
    return this.http.get<IOptionItemData[]>(`${this.baseApi}/preferred-languages`);
  }

  getPrimarySpokenLanguages(): Promise<IOptionItemData[]> {
    return this.http.get<IOptionItemData[]>(`${this.baseApi}/primary-spoken-languages`);
  }

  searchIndigenousIdentities(params: IAzureSearchParams): Promise<IAzureSearchResult<IIndigenousIdentityData>> {
    return this.http.get('/public-search/indigenous-identities', {
      params,
      isOData: true,
    });
  }

  submitRegistration(household: IHouseholdCreate, eventId: string, privacyDateTimeConsent: string): Promise<IHouseholdEntity> {
    const payload = this.parseHouseholdPayload(household, eventId, privacyDateTimeConsent);
    return this.http.post(`${this.baseUrl}`, payload, { globalHandler: false });
  }

  parseHouseholdPayload(household: IHouseholdCreate, eventId: string, privacyDateTimeConsent: string): ICreateHouseholdRequest {
    return {
      noFixedHome: household.noFixedHome,
      primaryBeneficiary: this.parseMember(household.primaryBeneficiary),
      additionalMembers: household.additionalMembers.map((member) => this.parseAdditionalMember(member)),
      homeAddress: household.noFixedHome ? null : this.parseAddress(household.homeAddress),
      eventId,
      privacyDateTimeConsent,
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
      homePhoneNumber: contactInformation.homePhoneNumber.number ? contactInformation.homePhoneNumber : null,
      mobilePhoneNumber: contactInformation.mobilePhoneNumber.number ? contactInformation.mobilePhoneNumber : null,
      alternatePhoneNumber: contactInformation.alternatePhoneNumber.number ? contactInformation.alternatePhoneNumber : null,
      email: contactInformation.email,
      preferredLanguage: {
        optionItemId: contactInformation.preferredLanguage.id,
        specifiedOther: contactInformation.preferredLanguage.isOther ? contactInformation.preferredLanguageOther : null,
      },
      primarySpokenLanguage: contactInformation.primarySpokenLanguage ? {
        optionItemId: contactInformation.primarySpokenLanguage.id,
        specifiedOther: contactInformation.primarySpokenLanguage.isOther ? contactInformation.primarySpokenLanguageOther : null,
      } : null,
    };
  }

  parseIdentitySet(identitySet: IIdentitySet): IIdentitySetCreateRequest {
    return {
      firstName: identitySet.firstName,
      middleName: identitySet.middleName,
      lastName: identitySet.lastName,
      preferredName: identitySet.preferredName,
      dateOfBirth: identitySet.dateOfBirth,
      gender: {
        optionItemId: identitySet.gender.id,
        specifiedOther: identitySet.gender.isOther ? identitySet.genderOther : null,
      },
      indigenousIdentity: this.parseIndigenousIdentity(identitySet),
    };
  }

  parseIndigenousIdentity(identitySet: IIdentitySet): IIndigenousIdentityOption {
    if (identitySet.indigenousCommunityId === null && identitySet.indigenousCommunityOther === null) {
      return null;
    }
    return {
      indigenousCommunityId: identitySet.indigenousCommunityId,
      specifiedOther: identitySet.indigenousCommunityOther,
    };
  }
}
