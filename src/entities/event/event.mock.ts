import { IAzureSearchResult, ECanadaProvinces } from '../../types';
import {
  IEventData, IEvent, IEventGenericLocation,
} from './event.types';

import { Event } from './event';
import { IShelterLocation } from '../beneficiary';

export const mockShelterLocations = (): IShelterLocation[] => ([
  {
    id: '7c076603-580a-4400-bef2-5ddececb5555',
    name: {
      translation: {
        en: 'YMCA Gym',
        fr: 'Gymnase du YMCA',
      },
    },
    status: 1,
    address: {
      country: 'CA',
      streetAddress: 'Pioneer Street',
      unitSuite: null,
      province: ECanadaProvinces.BC,
      city: 'Pemberton',
      postalCode: 'V0N 1L0',
    },
  },
]);

export const mockRegistrationLocations = (): IEventGenericLocation[] => ([
  {
    name: {
      translation: {
        en: 'YMCA Gym',
        fr: 'Gymnase du YMCA',
      },
    },
    status: 1,
    address: {
      country: 'CA',
      streetAddress: 'Pioneer Street',
      unitSuite: null,
      province: ECanadaProvinces.BC,
      city: 'Pemberton',
      postalCode: 'V0N 1L0',
    },
  },
]);

export const mockEventData = (): IEventData => ({
  eventId: '7c076603-580a-4400-bef2-5ddececb0931',
  responseDetails: {
    assistanceNumber: '+15144544545',
  },
  tenantId: 'tenant-guid',
  eventName: {
    translation: {
      en: 'Gatineau Floods 2021',
      fr: 'Inondations Gatineau 2021',
    },
  },
  registrationLink: {
    translation: {
      en: 'https://www.redcross.ca/gatineau-floods-2021',
      fr: 'https://www.redcross.ca/inondations-gatineau-2021',
    },
  },
  shelterLocations: mockShelterLocations(),
  registrationLocations: mockRegistrationLocations(),
});

export const mockSearchEventsData = (): IAzureSearchResult<IEventData> => ({
  odataContext: 'test',
  value: [
    mockEventData(),
  ],
});

export const mockEvent = (force?: Partial<IEventData>): IEvent => new Event({ ...mockEventData(), ...force });
