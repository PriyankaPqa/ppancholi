import { faker } from '@faker-js/faker';
import { IPersonalInfoFields } from '@/pages/registration/personalInformation.page';
import { IAddressPageFields } from '@/pages/registration/address.page';
import { IAddMembersPersonalInfoFields } from '@/pages/registration/addHouseholdMembers.page';
import { getCurrentDateString } from './generator';

const firstName = `${faker.name.firstName()} - ${getCurrentDateString()}`;
const lastName = faker.name.lastName();

export const primaryMemberData: IPersonalInfoFields = {
  firstName,
  lastName,
  gender: faker.helpers.arrayElement(['Female', 'Male']),
  dateOfBirth: faker.date.birthdate({ min: 16, max: 100, mode: 'age' }),
  preferredLanguage: 'French',
  emailAddress: faker.internet.email(firstName, lastName),
  indigenousIdentity: faker.helpers.arrayElement(['First Nation', 'Metis', 'Inuit', 'Other']),
};

export const addressData: IAddressPageFields = {
  placeName: faker.address.city(),
  streetAddress: faker.address.streetAddress(),
  municipality: faker.address.cityName(),
  province: 'ON',
  postalCode: faker.helpers.replaceSymbols('?#?#?#'),
  tempAddress: 'Remaining in home',
};

export const additionalMemberPersonalData: IAddMembersPersonalInfoFields = {
  firstName: `${faker.name.firstName()} - ${getCurrentDateString()}`,
  lastName: faker.name.lastName(),
  gender: 'Female',
  dateOfBirth: faker.date.birthdate({ min: 16, max: 100, mode: 'age' }),
  indigenousIdentity: 'First Nation',
};
