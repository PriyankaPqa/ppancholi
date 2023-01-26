import deepmerge from 'deepmerge';
import { IAzureSearchResult, ECanadaProvinces, ICombinedIndex } from '@libs/shared-lib/types';
import { mockEventMetadatum, IEventMetadata, IRegistrationAssessment } from '../event';
import {
  IEventData, IEvent, IEventGenericLocation, EEventStatus, EResponseLevel,
} from './registrationEvent.types';

import { RegistrationEvent } from './registrationEvent';
import { IShelterLocationData } from '../household-create';

export const mockShelterLocations = (): IShelterLocationData[] => ([
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

export const mockEventData = (): IEventData => ({
  id: '7c076603-580a-4400-bef2-5ddececb0931',
  responseDetails: {
    assistanceNumber: '+15144544545',
    responseLevel: EResponseLevel.Level1,
    eventType: null,
    dateReported: '',
  },
  tenantId: 'tenant-guid',
  name: {
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
  schedule: {
    status: EEventStatus.Open,
  },
  selfRegistrationEnabled: true,
  registrationAssessments: [{ assessmentId: 'assessmentId', id: 'id' } as IRegistrationAssessment],
});

export const mockSearchEventsData = (): IAzureSearchResult<ICombinedIndex<IEventData, IEventMetadata>> => ({
  odataContext: 'test',
  odataCount: 1,
  value: [
    {
      id: '',
      tenantId: '',
      entity: mockEventData(),
      metadata: mockEventMetadatum(),
    },
  ],
});

export const mockEvent = (force?: Partial<IEventData>): IEvent => new RegistrationEvent(deepmerge(mockEventData(), force || {}));
