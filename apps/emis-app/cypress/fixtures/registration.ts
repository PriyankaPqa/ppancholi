import { faker } from '@faker-js/faker';
import { getCurrentDateString, removeSpecialCharacters } from '@libs/cypress-lib/helpers';
import { IAddMembersPersonalInfoFields } from '@libs/cypress-lib/pages/registration/addHouseholdMembers.page';
import { IAddressPageFields } from '@libs/cypress-lib/pages/registration/address.page';
import { IPersonalInfoFields } from '@libs/cypress-lib/pages/registration/personalInformation.page';

const firstName = (retries: number) => `${removeSpecialCharacters(faker.name.firstName())} ${getCurrentDateString()}- retires${retries}`;
const lastName = removeSpecialCharacters(faker.name.lastName());

export const fixturePrimaryMember = (retries: number, force?:IPersonalInfoFields) : IPersonalInfoFields => ({
  firstName: firstName(retries),
  lastName,
  gender: faker.helpers.arrayElement(['Female', 'Male']),
  dateOfBirth: faker.date.birthdate({ min: 16, max: 100, mode: 'age' }),
  preferredLanguage: 'French',
  emailAddress: faker.internet.email(firstName(retries), lastName),
  indigenousIdentity: faker.helpers.arrayElement(['First Nation', 'Metis', 'Inuit', 'Other']),
  ...force,
});

export const fixtureAddressData = (force?: IAddressPageFields) : IAddressPageFields => ({
  placeName: faker.address.city(),
  streetAddress: faker.address.streetAddress(),
  municipality: faker.address.cityName(),
  province: 'ON',
  postalCode: faker.helpers.replaceSymbols('?#?#?#'),
  tempAddress: 'Remaining in home',
  ...force,
});

export const fixtureAdditionalMemberPersonalData = (retries: number) : IAddMembersPersonalInfoFields => ({
  firstName: `${removeSpecialCharacters(faker.name.firstName())} - ${getCurrentDateString()} - retries${retries}`,
  lastName: faker.name.lastName(),
  gender: 'Female',
  dateOfBirth: faker.date.birthdate({ min: 16, max: 100, mode: 'age' }),
  indigenousIdentity: 'First Nation',
});
