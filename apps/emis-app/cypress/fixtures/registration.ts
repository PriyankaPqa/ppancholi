import { faker } from '@faker-js/faker';
import { getCurrentDateString } from '@libs/cypress-lib/helpers';
import { IAddMembersPersonalInfoFields } from '@libs/cypress-lib/pages/registration/addHouseholdMembers.page';
import { IAddressPageFields } from '@libs/cypress-lib/pages/registration/address.page';
import { IPersonalInfoFields } from '@libs/cypress-lib/pages/registration/personalInformation.page';

const firstName = (retries: number) => `${faker.name.firstName()} ${getCurrentDateString()}- retires${retries}`;
const lastName = faker.name.lastName();

export const fixturePrimaryMember = (retries: number) : IPersonalInfoFields => ({
  firstName: firstName(retries),
  lastName,
  gender: faker.helpers.arrayElement(['Female', 'Male']),
  dateOfBirth: faker.date.birthdate({ min: 16, max: 100, mode: 'age' }),
  preferredLanguage: 'French',
  emailAddress: faker.internet.email(firstName(retries), lastName),
  indigenousIdentity: faker.helpers.arrayElement(['First Nation', 'Metis', 'Inuit', 'Other']),
});

export const fixtureAddressData = () : IAddressPageFields => ({
  placeName: faker.address.city(),
  streetAddress: faker.address.streetAddress(),
  municipality: faker.address.cityName(),
  province: 'ON',
  postalCode: faker.helpers.replaceSymbols('?#?#?#'),
  tempAddress: 'Remaining in home',
});

export const fixtureAdditionalMemberPersonalData = (retries: number) : IAddMembersPersonalInfoFields => ({
  firstName: `${faker.name.firstName()} - ${getCurrentDateString()} - retries${retries}`,
  lastName: faker.name.lastName(),
  gender: 'Female',
  dateOfBirth: faker.date.birthdate({ min: 16, max: 100, mode: 'age' }),
  indigenousIdentity: 'First Nation',
});
