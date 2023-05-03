import { faker } from '@faker-js/faker';
import { format } from 'date-fns';
import { getRandomNumber } from '@libs/cypress-lib/helpers';
import { EEventCallCentreStatus, IEventCallCentre, IEventGenericLocation } from '@libs/entities-lib/event';
import { ECanadaProvinces } from '@libs/shared-lib/types';
import { EventStatus, ICreateEventFields } from '../pages/events/createEvent.page';
import { IAddNewProgramFields } from '../pages/programs/addNewEventProgram.page';
import { IFinancialAssistanceTableData } from '../pages/financialAssistance/createFinancialAssistanceTable.page';

export const fixtureEvent = (retries: number): ICreateEventFields => ({
  name: {
    translation: {
      en: `test-auto-event-${format(Date.now(), 'yyyy-MM-dd-H-mm-ss')}-s${getRandomNumber()}-retry-${retries}`,
      fr: `fr-test-auto-event-${format(Date.now(), 'yyyy-MM-dd-H-mm-ss')}-s${getRandomNumber()}-retry-${retries}`,
    },
  },
  responseLevelIndex: 1,
  provinceCode: 'AB',
  region: 'my custom region',
  eventType: 'Earthquake',
  eventStatus: EventStatus.open,
  assistanceNumber: faker.helpers.replaceSymbols('(514) 2##-####'),
  relatedEventsIndex: [0, 1],
  description: {
    translation: {
      en: 'This is english event description',
      fr: 'This is french event description',
    },
  },
  reportedDate: { year: 1990, month: 1, day: 31 },
});

export const fixtureCallCentre = (retries: number) : IEventCallCentre => ({
  name: {
    translation: {
      en: `Ontario - retry${retries} - `,
      fr: `Montreal - retry${retries} - `,
    },
  },
  details: {
    translation: {
      en: 'This is English Description of Event',
      fr: "Ceci est la description française de l'événement",
    },
  },
  startDate: format(Date.now(), 'yyyy-MM-dd'),
  endDate: format(faker.date.future(), 'yyyy-MM-dd'),
  status: EEventCallCentreStatus.Active,
});

export const fixtureLocation = (retries: number): IEventGenericLocation => ({
  name: {
    translation: {
      en: `Toronto - retry${retries} - `,
      fr: `Toronto-fr - retry${retries} - `,
    },
  },
  address: {
    country: 'CA',
    streetAddress: faker.address.streetAddress(),
    city: faker.address.cityName(),
    province: ECanadaProvinces.NT,
    postalCode: faker.helpers.replaceSymbols('?#?#?#'),
  },
  status: null,
});

export const fixtureProgram = (retries: number): IAddNewProgramFields => ({
  name: {
    translation: {
      en: `Program En ${faker.datatype.number(1000)} - retry${retries}`,
      fr: `Program Fr ${faker.datatype.number(1000)} - retry${retries}`,
    },
  },
  description: {
    translation: {
      en: 'Program Description En for TC323',
      fr: 'Program Description Fr for TC323',
    },
  },
  paymentModalitiesIndex: 1,
});

export const fixtureFinancialAssistanceTable = (retries: number): IFinancialAssistanceTableData => ({
  name: {
    translation: {
      en: `table-${faker.datatype.number(1000)} - retry${retries}`,
      fr: `table-fr-${faker.datatype.number(1000)} - retry${retries}`,
    },
  },
  itemType: 'Clothing',
  subItem: {
    type: 'Winter Clothing',
    maxAmount: '80',
    frequency: 'Multiple',
  },
});
