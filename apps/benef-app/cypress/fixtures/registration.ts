import { faker } from '@faker-js/faker';
import { generateName, getCurrentDateString } from '@libs/cypress-lib/helpers';
import { IAddMembersPersonalInfoFields } from '@libs/cypress-lib/pages/registration/addHouseholdMembers.page';
import { IAddressPageFields } from '@libs/cypress-lib/pages/registration/address.page';
import { IPersonalInfoFields, PreferredLanguage } from '@libs/cypress-lib/pages/registration/personalInformation.page';

const firstName = (retries: number) => `${generateName('firstName')} ${getCurrentDateString()}- retires${retries}`;
const lastName = generateName('lastName');

export const fixturePrimaryMember = (retries: number) : IPersonalInfoFields => ({
  firstName: firstName(retries),
  lastName,
  gender: faker.helpers.arrayElement(['Female', 'Male']),
  dateOfBirth: faker.date.birthdate({ min: 16, max: 100, mode: 'age' }),
  preferredLanguage: PreferredLanguage.French,
  emailAddress: faker.internet.email(firstName(retries), lastName),
  indigenousIdentity: faker.helpers.arrayElement(['First Nation', 'Metis', 'Inuit', 'Other']),
});

export const fixtureAddressData = (retries: number) : IAddressPageFields => ({
  placeName: `${faker.address.city()} - retries${retries}`,
  streetAddress: faker.address.streetAddress(),
  municipality: faker.address.cityName(),
  province: 'ON',
  postalCode: faker.helpers.replaceSymbols('?#?#?#'),
  tempAddress: 'Remaining In Home',
});

export const fixtureAdditionalMemberPersonalData = (retries: number) : IAddMembersPersonalInfoFields => ({
  firstName: `${generateName('firstName')} - ${getCurrentDateString()} - retries${retries}`,
  lastName: generateName('lastName'),
  gender: 'Female',
  dateOfBirth: faker.date.birthdate({ min: 16, max: 100, mode: 'age' }),
  indigenousIdentity: 'First Nation',
});
