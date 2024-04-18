import { ECurrentAddressTypes } from '@libs/entities-lib/value-objects/current-address';
import { faker } from '@faker-js/faker';
import { format } from 'date-fns';
import { ICaseNotesData } from '../pages/casefiles/caseNotes.page';

export interface IFixtureTemporaryAddress {
  checkIn: string;
  checkOut: string;
  crcProvided: boolean;
  addressType: ECurrentAddressTypes;
  address: {
    city: string;
    province: string;
    country: string;
    postalCode: string;
    unitSuite: string;
    streetAddress: string;
  },
}

export const fixtureCaseNotes = (retries: number): ICaseNotesData => ({
  subject: `Case Notes - retries${retries}`,
  category: ' Action log ',
  description: 'Case Notes Description En',
});

export const fixtureTemporaryAddress = (force?: IFixtureTemporaryAddress): IFixtureTemporaryAddress => ({
  checkIn: format(Date.now(), 'PP'),
  checkOut: format(faker.date.future(), 'PP'),
  crcProvided: false,
  addressType: ECurrentAddressTypes.FriendsFamily,
  address: {
    city: faker.address.cityName(),
    province: 'ON',
    country: 'CA',
    postalCode: faker.helpers.replaceSymbols('?#?#?#'),
    unitSuite: faker.helpers.replaceSymbols('##'),
    streetAddress: faker.address.streetAddress(),
  },
  ...force,
});
