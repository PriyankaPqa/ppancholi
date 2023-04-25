import {
  ECurrentAddressTypes,
  IContactInformationCreateRequest,
  ICreateHouseholdRequest,
  ICurrentAddressCreateRequest,
  IIdentitySetCreateRequest,
  MemberCreateRequest,
} from '@libs/entities-lib/household-create';
import { faker } from '@faker-js/faker';
import { ECanadaProvinces } from '@libs/shared-lib/types';
import { Genders, generateDateOfBirth, getCurrentDateString, getRandomNumber, PreferredLanguages, PrimarySpokenLanguages, today } from '../../helpers';

const mockCurrentAddressCreateRequest = (force?: Partial<ICurrentAddressCreateRequest>): ICurrentAddressCreateRequest => ({
  addressType: ECurrentAddressTypes.RemainingInHome,
  placeNumber: '',
  placeName: '',
  shelterLocationId: null,
  address: null,
  from: today,
  ...force,
});

const mockIdentitySetCreateRequest = (force?: Partial<IIdentitySetCreateRequest>): IIdentitySetCreateRequest => ({
  firstName: `${faker.name.firstName()} - ${getCurrentDateString()}`,
  middleName: '',
  lastName: faker.name.lastName(),
  preferredName: '',
  dateOfBirth: generateDateOfBirth(),
  gender: {
    optionItemId: Genders.Female,
    specifiedOther: null,
  },
  indigenousIdentity: null,
  ...force,
});

export const mockAdditionalMemberCreateRequest = (force?: Partial<MemberCreateRequest>): MemberCreateRequest => ({
  identitySet: mockIdentitySetCreateRequest(),
  currentAddress: mockCurrentAddressCreateRequest(),
  contactInformation: null,
  ...force,
});

export const mockContactInformationCreateRequest = (force?: Partial<IContactInformationCreateRequest>): IContactInformationCreateRequest => ({
  homePhoneNumber: {
    number: faker.phone.number('(514) 3##-####'), // Digit 1 of seven digit local phone number cannot be 0 or 1.
    countryCode: 'CA',
    e164Number: faker.phone.number('+15143######'),
  },
  mobilePhoneNumber: null,
  alternatePhoneNumber: null,
  email: faker.internet.email(),
  preferredLanguage: {
    optionItemId: PreferredLanguages.French,
    specifiedOther: null,
  },
  primarySpokenLanguage: {
    optionItemId: PrimarySpokenLanguages.English,
    specifiedOther: null,
  },
  ...force,
});

export const mockCreateHouseholdRequest = (force?: Partial<ICreateHouseholdRequest>): ICreateHouseholdRequest => {
  const firstName = `${faker.name.firstName()}`;
  const lastName = `${faker.name.lastName()} - ${getCurrentDateString()}-s${getRandomNumber()}`;

  return {
    noFixedHome: false,
    primaryBeneficiary: {
      identitySet: mockIdentitySetCreateRequest({ firstName, lastName }),
      currentAddress: mockCurrentAddressCreateRequest(),
      contactInformation: mockContactInformationCreateRequest({ email: faker.internet.email(firstName, lastName) }),
    },
    additionalMembers: [
      mockAdditionalMemberCreateRequest(),
      mockAdditionalMemberCreateRequest(),
      mockAdditionalMemberCreateRequest(),
      mockAdditionalMemberCreateRequest(),
    ],
    homeAddress: {
      country: 'CA',
      streetAddress: faker.address.streetAddress(),
      unitSuite: faker.address.buildingNumber(),
      province: ECanadaProvinces.AB,
      specifiedOtherProvince: null,
      city: 'Quebec',
      postalCode: faker.helpers.replaceSymbols('?#? #?#'),
      latitude: parseFloat(faker.address.latitude()),
      longitude: parseFloat(faker.address.longitude()),
    },
    eventId: faker.datatype.uuid(),
    consentInformation: {
      crcUserName: faker.name.fullName(),
      registrationMethod: 2,
      registrationLocationId: null,
      privacyDateTimeConsent: today,
  },
    name: null,
  ...force,
  };
};
