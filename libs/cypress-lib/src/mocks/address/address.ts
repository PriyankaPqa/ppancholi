import { IAddressPageFields } from '@/pages/registration/address.page';
import { faker } from '@faker-js/faker';

export const addressData: IAddressPageFields = {
  unitNumber: `${faker.datatype.number(1000)}`,
  streetAddress: faker.address.streetAddress(),
  municipality: faker.address.cityName(),
  province: faker.helpers.arrayElement(['ON', 'QC', 'MB', 'NU']),
  postalCode: faker.helpers.replaceSymbols('?#?#?#'),
};
