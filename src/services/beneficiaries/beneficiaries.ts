import { IHttpClient } from '@/services/httpClient';
import { IAzureSearchParams, IAzureSearchResult, IOptionItemData } from '../../types';
import {
  ETemporaryAddressTypes,
  IBeneficiary,
  IBeneficiaryData,
  IContactInformation,
  IContactInformationForCreate,
  ICreateBeneficiaryRequest,
  IIndigenousIdentityData,
  IPerson,
  IPersonForCreate,
  IPhoneNumber,
  IPhoneNumberForCreate,
  ITemporaryAddress,
  ITemporaryAddressForCreate,
} from '../../entities/beneficiary';
import { IBeneficiariesService } from './beneficiaries.types';

export class BeneficiariesService implements IBeneficiariesService {
  constructor(private readonly http: IHttpClient) {}

  getGenders(): Promise<IOptionItemData[]> {
    return this.http.get<IOptionItemData[]>('/beneficiary/genders');
  }

  getPreferredLanguages(): Promise<IOptionItemData[]> {
    return this.http.get<IOptionItemData[]>('/beneficiary/preferred-languages');
  }

  getPrimarySpokenLanguages(): Promise<IOptionItemData[]> {
    return this.http.get<IOptionItemData[]>('/beneficiary/primary-spoken-languages');
  }

  searchIndigenousIdentities(params: IAzureSearchParams): Promise<IAzureSearchResult<IIndigenousIdentityData>> {
    return this.http.get('/public-search/indigenous-identities', {
      params,
      isOData: true,
    });
  }

  submitRegistration(beneficiary: IBeneficiary, eventId: string): Promise<IBeneficiaryData> {
    const payload = this.buildBeneficiaryPayload(beneficiary, eventId);
    return this.http.post('/beneficiary/beneficiaries', payload);
  }

  buildBeneficiaryPayload(beneficiary: IBeneficiary, eventId: string): ICreateBeneficiaryRequest {
    const {
      noFixedHome, person, contactInformation, householdMembers,
    } = beneficiary;

    return {
      ...beneficiary,
      person: this.buildPerson(person),
      contactInformation: this.buildContactInformation(contactInformation),
      householdMembers: householdMembers.map((member) => this.buildPerson(member)),
      homeAddress: noFixedHome ? null : beneficiary.homeAddress,
      eventId,
    };
  }

  buildPerson(person: IPerson): IPersonForCreate {
    return {
      ...person,
      gender: {
        optionItemId: person.gender.id,
        specifiedOther: person.gender.isOther ? person.genderOther : null,
      },
      temporaryAddress: this.buildTemporaryAddress(person.temporaryAddress),
    };
  }

  buildTemporaryAddress(temporaryAddress: ITemporaryAddress): ITemporaryAddressForCreate {
    const noPlaceAddress = temporaryAddress.temporaryAddressType === ETemporaryAddressTypes.RemainingInHome
                        || temporaryAddress.temporaryAddressType === ETemporaryAddressTypes.Other
                        || temporaryAddress.temporaryAddressType === ETemporaryAddressTypes.Shelter
                        || temporaryAddress.temporaryAddressType === ETemporaryAddressTypes.Unknown;

    return {
      temporaryAddressType: temporaryAddress.temporaryAddressType,
      placeNumber: temporaryAddress.placeNumber,
      placeName: temporaryAddress.placeName,
      shelterLocationName: temporaryAddress.shelterLocation?.name,
      placeAddress: noPlaceAddress ? null : {
        country: temporaryAddress.country,
        streetAddress: temporaryAddress.streetAddress,
        unitSuite: temporaryAddress.unitSuite,
        province: temporaryAddress.province,
        city: temporaryAddress.city,
        postalCode: temporaryAddress.postalCode,
        latitude: temporaryAddress.latitude,
        longitude: temporaryAddress.longitude,
      },
    };
  }

  buildContactInformation(contactInformation: IContactInformation): IContactInformationForCreate {
    const otherPhone = this.buildPhoneNumber(contactInformation.otherPhone);

    return {
      homePhoneNumber: this.buildPhoneNumber(contactInformation.homePhone),
      mobilePhoneNumber: this.buildPhoneNumber(contactInformation.mobilePhone),
      alternatePhoneNumber: !otherPhone ? null : {
        ...otherPhone,
        extension: contactInformation.otherPhoneExtension,
      },
      email: contactInformation.email,
      preferredLanguage: {
        optionItemId: contactInformation.preferredLanguage.id,
        specifiedOther: contactInformation.preferredLanguage.isOther ? contactInformation.preferredLanguageOther : null,
      },
      primarySpokenLanguage: {
        optionItemId: contactInformation.primarySpokenLanguage.id,
        specifiedOther: contactInformation.primarySpokenLanguage.isOther ? contactInformation.primarySpokenLanguageOther : null,
      },
    };
  }

  buildPhoneNumber(phone: IPhoneNumber): IPhoneNumberForCreate {
    return !phone.e164Number || !phone.number ? null : {
      ...phone,
      countryCode: phone.countryISO2,
    };
  }
}
