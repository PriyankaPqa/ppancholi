import { faker } from '@faker-js/faker';
import { IAddressPageFields } from '@libs/cypress-lib/pages/registration/address.page';
import { IPersonalInfoFields, PreferredLanguage } from '@libs/cypress-lib/pages/registration/personalInformation.page';
import { format } from 'date-fns';
import { generateName, removeSpecialCharacters } from '@libs/cypress-lib/helpers';
import { IHouseholdMemberFields } from '../pages/casefiles/addHouseholdMember.page';
import { ICRCPrivacyStatementPageFields, PrivacyRegistrationMethod } from '../pages/registration/crcPrivacyStatement.page';

export const fixturePrivacy = (): ICRCPrivacyStatementPageFields => ({
  privacyRegistrationMethod: PrivacyRegistrationMethod.Phone,
  userName: removeSpecialCharacters(generateName('fullName')),
});

export const fixturePrimaryBeneficiary = (): IPersonalInfoFields => ({
  preferredLanguage: PreferredLanguage.French,
  indigenousIdentity: faker.helpers.arrayElement(['First Nation', 'Metis', 'Inuit', 'Other']),
});

export const fixtureCreateAddress = (): IAddressPageFields => ({
  placeName: faker.address.city(),
  streetAddress: faker.address.streetAddress(),
  municipality: faker.address.cityName(),
  province: faker.helpers.arrayElement(['ON', 'QC', 'MB', 'NU']),
  postalCode: faker.helpers.replaceSymbols('?#?#?#'),
  tempAddress: 'Remaining In Home',
});

export const fixtureHouseholdMember = (retries: number) : IHouseholdMemberFields => ({
  firstName: `${removeSpecialCharacters(generateName('firstName'))}-${retries}`,
  lastName: removeSpecialCharacters(generateName('lastName')),
  middleName: removeSpecialCharacters(generateName('middleName')),
  gender: faker.helpers.arrayElement(['Female', 'Male']),
  dateOfBirth: format(faker.date.birthdate({ min: 16, max: 100, mode: 'age' }), 'yyyy-MM-dd'),
  indigenousIdentity: faker.helpers.arrayElement(['First Nation', 'Metis', 'Inuit', 'Other']),
});

export const fixtureAddress = () : IAddressPageFields => ({
  unitNumber: `${faker.datatype.number(1000)}`,
  streetAddress: faker.address.streetAddress(),
  municipality: faker.address.cityName(),
  province: faker.helpers.arrayElement(['ON', 'QC', 'MB', 'NU']),
  postalCode: faker.helpers.replaceSymbols('?#?#?#'),
});
