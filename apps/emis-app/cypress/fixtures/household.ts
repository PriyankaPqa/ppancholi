import { faker } from '@faker-js/faker';
import { IAddressPageFields } from '@libs/cypress-lib/pages/registration/address.page';
import { IPersonalInfoFields, PreferredLanguage } from '@libs/cypress-lib/pages/registration/personalInformation.page';
import { IHouseholdMemberFields } from 'cypress/pages/casefiles/addHouseholdMember.page';
import { format } from 'date-fns';
import { removeSpecialCharacters } from '@libs/cypress-lib/helpers';
import { ICRCPrivacyStatementPageFields, PrivacyRegistrationMethod } from '../pages/registration/crcPrivacyStatement.page';

export const fixturePrivacy = (): ICRCPrivacyStatementPageFields => ({
  privacyRegistrationMethod: PrivacyRegistrationMethod.Phone,
  userName: removeSpecialCharacters(faker.name.fullName()),
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
  firstName: `${removeSpecialCharacters(faker.name.firstName())}-${retries}`,
  lastName: removeSpecialCharacters(faker.name.lastName()),
  middleName: removeSpecialCharacters(faker.name.middleName()),
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
