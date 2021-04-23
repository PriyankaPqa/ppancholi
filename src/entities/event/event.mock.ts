import { IAzureSearchResult, ECanadaProvinces } from '../../types';
import {
  IEventData, IShelterLocation, IEvent,
} from './event.types';

import { Event } from './event';

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
      street: 'Pioneer Street',
      unitSuite: null,
      provinceTerritory: ECanadaProvinces.BC,
      city: 'Pemberton',
      postalCode: 'V0N 1L0',
      geoLocation: {
        lat: null,
        lng: null,
      },
      reset: null,
      validate: null,
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
});

export const mockSearchEventsData = (): IAzureSearchResult<IEventData> => ({
  odataContext: 'test',
  value: [
    mockEventData(),
  ],
});

export const mockEvent = (force?: Partial<IEventData>): IEvent => new Event({ ...mockEventData(), ...force });
