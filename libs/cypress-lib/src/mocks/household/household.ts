import {
  ECurrentAddressTypes,
  IAddressData,
  IContactInformationCreateRequest,
  ICreateHouseholdRequest,
  ICurrentAddress,
  ICurrentAddressCreateRequest,
  IIdentitySetCreateRequest,
  MemberCreateRequest,
} from '@libs/entities-lib/household-create';
import { faker } from '@faker-js/faker';
import { ECanadaProvinces } from '@libs/shared-lib/types';
import { Genders, generateDateOfBirth, getCurrentDateString, getRandomNumber, PreferredLanguages, today } from '../../helpers';

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

export const mockContactInformationCreateRequest = (force?: Partial<IContactInformationCreateRequest>): IContactInformationCreateRequest => {
  const phoneNumber = faker.phone.number('5143######'); // Digit 1 of seven digit local phone number cannot be 0 or 1.

  return {
    homePhoneNumber: {
      number: phoneNumber,
      countryCode: 'CA',
      e164Number: `+1${phoneNumber}`,
    },
    mobilePhoneNumber: null,
    alternatePhoneNumber: null,
    email: faker.internet.email(),
    preferredLanguage: {
      optionItemId: PreferredLanguages.French,
      specifiedOther: null,
    },
    primarySpokenLanguage: null,
    ...force,
  };
};

export const mockBaseAddressData = (force?: Partial<IAddressData>): IAddressData => ({
  country: 'CA',
  streetAddress: faker.address.streetAddress(),
  city: 'Quebec',
  province: ECanadaProvinces.AB,
  postalCode: faker.helpers.replaceSymbols('?#? #?#'),
  latitude: parseFloat(faker.address.latitude()),
  longitude: parseFloat(faker.address.longitude()),
  unitSuite: faker.address.buildingNumber(),
  specifiedOtherProvince: null,
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
    homeAddress: mockBaseAddressData(),
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

export const mockCustomCurrentAddressCreateRequest = (addressType: ECurrentAddressTypes): ICurrentAddress => ({
  ...mockCurrentAddressCreateRequest(),
  addressType,
  address: mockBaseAddressData(),
});

export const mockUpdatePersonIdentityRequest = () => ({
  contactInformation: mockContactInformationCreateRequest(),
  identitySet: {
    ...mockIdentitySetCreateRequest(),
    gender: {
      id: '02b9bedd-08fa-4e4f-898c-dbcd4296390e',
      isOther: true,
    },
    genderOther: 'before mass action data correction',
  },
});

export const mockCreateHouseholdManageDuplicateRequest = (force?: Partial<ICreateHouseholdRequest>): ICreateHouseholdRequest => {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const phoneNumber = faker.phone.number('5143######');

  return {
    noFixedHome: false,
    primaryBeneficiary: {
      identitySet: mockIdentitySetCreateRequest({ firstName, lastName }),
      currentAddress: mockCurrentAddressCreateRequest(),
      contactInformation: mockContactInformationCreateRequest({
        homePhoneNumber: {
          number: phoneNumber,
          countryCode: 'CA',
          e164Number: `+1${phoneNumber}`,
        },
      }),
    },
    additionalMembers: [],
    homeAddress: mockBaseAddressData(),
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

export const mockCreateDuplicateHouseholdWithSameAddressRequest = (previousHouseholdAddress: IAddressData, eventId: string): ICreateHouseholdRequest => {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const phoneNumber = faker.phone.number('5143######');

  const mockRequest: ICreateHouseholdRequest = {
    noFixedHome: false,
    primaryBeneficiary:
    {
      identitySet: mockIdentitySetCreateRequest({ firstName, lastName }),
      currentAddress: mockCurrentAddressCreateRequest(),
      contactInformation: mockContactInformationCreateRequest({
        homePhoneNumber: {
          number: phoneNumber,
          countryCode: 'CA',
          e164Number: `+1${phoneNumber}`,
        },
      }),
    },
    additionalMembers: [],
    homeAddress:
    {
      country: 'CA',
      streetAddress: previousHouseholdAddress.streetAddress,
      unitSuite: previousHouseholdAddress.unitSuite,
      province: previousHouseholdAddress.province,
      specifiedOtherProvince: null,
      city: previousHouseholdAddress.city,
      postalCode: previousHouseholdAddress.postalCode,
      latitude: 0,
      longitude: 0,
    },
    eventId,
    consentInformation: {
      crcUserName: '',
      registrationMethod: null,
      registrationLocationId: null,
      privacyDateTimeConsent: today,
    },
    name: null,
  };
  return mockRequest;
};

export const mockCreateDuplicateHouseholdWithSamePhoneNumberRequest = (eventId: string, phoneNumber: string): ICreateHouseholdRequest => {
  const mockRequest: ICreateHouseholdRequest = {
    noFixedHome: false,
    primaryBeneficiary: {
      identitySet: mockIdentitySetCreateRequest({ firstName: faker.name.firstName(), lastName: faker.name.lastName() }),
      currentAddress: mockCurrentAddressCreateRequest(),
      contactInformation: mockContactInformationCreateRequest({
        homePhoneNumber: {
          number: phoneNumber,
          countryCode: 'CA',
          e164Number: `+1${phoneNumber}`,
        },
      }),
    },
    additionalMembers: [],
    homeAddress: mockBaseAddressData(),
    eventId,
    consentInformation: {
      crcUserName: faker.name.fullName(),
      registrationMethod: 2,
      registrationLocationId: null,
      privacyDateTimeConsent: today,
    },
    name: null,
  };
  return mockRequest;
};
