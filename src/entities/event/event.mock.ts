import { ECanadaProvinces, IAzureSearchResult } from '@/types';
import {
  EEventCallCentreStatus,
  EEventStatus, IEventData, IEventSearchData, IOtherProvince, IRegion,
} from './event.types';

export const mockEventsData = (): IEventData[] => [{
  number: 1,
  name: {
    translation: {
      en: 'Gatineau Floods 2021',
      fr: 'Inondations Gatineau 2021',
    },
  },
  description: {
    translation: {
      en: 'Desc EN',
      fr: 'Desc FR',
    },
  },
  registrationLink: {
    translation: {
      en: 'https://www.redcross.ca/gatineau-floods-2021',
      fr: 'https://www.redcross.ca/inondations-gatineau-2021',
    },
  },

  location: {
    province: 11,
    provinceOther: {
      translation: {
        en: '',
        fr: '',
      },
    },
    region: {
      translation: {
        en: '',
        fr: '',
      },
    },
  },
  schedule: {
    status: EEventStatus.OnHold,
    scheduledOpenDate: '2021-03-15T00:00:00Z',
    scheduledCloseDate: '2021-06-15T00:00:00Z',
    openDate: null,
    reOpenReason: '',
    hasBeenOpen: false,
    closeDate: null,
    closeReason: null,
  },
  responseDetails: {
    responseLevel: 3,
    eventType: {
      optionItemId: '41c362cc-3bed-4707-97e3-732ef3a2ebbf',
      specifiedOther: '',
    },
    dateReported: '2021-01-01T00:00:00Z',
    assistanceNumber: '+15144544545',
  },
  relatedEventIds: [],
  id: '7c076603-580a-4400-bef2-5ddececb0123',
  created: '2021-01-20T15:12:03.4219037Z',
  timestamp: '2021-01-20T15:12:03.4230487Z',
  eTag: '"00004331-0000-0a00-0000-600848430000"',
  callCentres: [],
  registrationLocations: [],
  selfRegistrationEnabled: false,
}, {
  number: 2,
  name: {
    translation: {
      en: 'Vegas Earthquake 2021',
      fr: 'Vegas Earthquake 2021 FR',
    },
  },
  description: {
    translation: {
      en: 'Desc EN',
      fr: 'Desc FR',
    },
  },
  registrationLink: {
    translation: {
      en: 'https://www.redcross.ca/vegas-earthquake-2021',
      fr: 'https://www.redcross.ca/vegas-earthquake-2021-fr',
    },
  },
  location: {
    province: 14,
    provinceOther: {
      translation: {
        en: 'Nevada',
        fr: 'Nevada FR',
      },
    },
    region: {
      translation: {
        en: 'Clark County',
        fr: 'Clark County FR',
      },
    },
  },
  schedule: {
    status: EEventStatus.Open,
    scheduledOpenDate: '2021-03-01T00:00:00Z',
    scheduledCloseDate: null,
    openDate: null,
    reOpenReason: 'Re-opened',
    hasBeenOpen: true,
    closeDate: null,
    closeReason: null,
  },
  responseDetails: {
    responseLevel: 3,
    eventType: {
      optionItemId: '41c362cc-3bed-4707-97e3-732ef3a2ebbf',
      specifiedOther: '',
    },
    dateReported: '2021-01-01T00:00:00Z',
    assistanceNumber: '+15144544545',
  },
  relatedEventIds: [],
  id: '87776243-696f-426b-b961-31ee98e3a4cd',
  created: '2021-01-20T15:45:52.2691443Z',
  timestamp: '2021-01-20T15:45:52.2699289Z',
  eTag: '*',
  callCentres: [],
  registrationLocations: [],
  selfRegistrationEnabled: false,
}];

export const mockOtherProvinceData = (): IAzureSearchResult<IOtherProvince> => ({
  odataCount: 2,
  odataContext: 'context',
  value: [{
    name: {
      translation: {
        en: 'New York',
        fr: 'New York FR',
      },
    },
  }, {
    name: {
      translation: {
        en: 'California',
        fr: 'Californie',
      },
    },
  }],
});

export const mockRegionData = (): IAzureSearchResult<IRegion> => ({
  odataCount: 2,
  odataContext: 'context',
  value: [{
    province: ECanadaProvinces.AB,
    name: {
      translation: {
        en: 'Southern Alberta',
        fr: 'Southern Alberta FR',
      },
    },
  }, {
    province: ECanadaProvinces.AB,
    name: {
      translation: {
        en: 'Northern Alberta',
        fr: 'Northern Alberta FR',
      },
    },
  }],
});

// eslint-disable-next-line
export const mockEventsSearchData = () : IEventSearchData[] => [
  {
    '@searchScore': 10,
    createdDate: mockEventsData()[0].created,
    eventId: mockEventsData()[0].id,
    eventDescription: mockEventsData()[0].description,
    eventName: mockEventsData()[0].name,
    eventStatus: 1,
    eventTypeId: '41c362cc-3bed-4707-97e3-732ef3a2ebbf',
    eventTypeName: {
      translation: {
        en: 'Flood',
        fr: 'Inondation',
      },
    },
    location: mockEventsData()[0].location,
    number: 1,
    provinceName: {
      translation: {
        en: 'Alberta',
        fr: 'Alberta FR',
      },
    },
    relatedEventsInfos: [{
      id: '87776243-696f-426b-b961-31ee98e3a4cd',
      eventName: {
        translation: {
          en: 'Vegas Earthquake 2021',
          fr: 'Vegas Earthquake 2021 FR',
        },
      },
    }],
    registrationLink: mockEventsData()[0].registrationLink,
    responseDetails: mockEventsData()[0].responseDetails,
    responseLevelName: {
      translation: {
        en: 'Level1',
        fr: 'Niveau1',
      },
    },
    selfRegistrationEnabled: false,
    schedule: mockEventsData()[0].schedule,
    scheduleEventStatusName: {
      translation: {
        en: 'On hold',
        fr: 'En attente',
      },
    },
    tenantId: '7c076603-580a-4400-bef2-5ddececb0931',
    callCentres: [{
      name: {
        translation: {
          en: 'z call center 1',
          fr: 'call center 1 fr',
        },
      },
      startDate: '2021-03-01T00:00:00Z',
      endDate: null,
      status: EEventCallCentreStatus.Active,
      details: {
        translation: {
          en: 'call center 1 details',
          fr: 'call center 1  details fr',
        },
      },
    }, {
      name: {
        translation: {
          en: 'call center 2',
          fr: 'call center 2 fr',
        },
      },
      startDate: '2021-03-01T00:00:00Z',
      endDate: null,
      status: EEventCallCentreStatus.Active,
      details: {
        translation: {
          en: 'call center 1 details',
          fr: 'call center 1  details fr',
        },
      },
    }],
    registrationLocations: [{
      status: 2,
      name: {
        translation: {
          en: 'test en',
          fr: 'test fr',
        },
      },
      address: {
        country: 'CA',
        streetAddress: 'test address',
        unitSuite: null,
        province: 2,
        city: 'test',
        postalCode: 'h2k2k2',
      },
    }],
  },
  {
    '@searchScore': 10,
    createdDate: mockEventsData()[0].created,
    eventId: '15545459867413768',
    eventDescription: mockEventsData()[0].description,
    eventName: mockEventsData()[0].name,
    eventStatus: 1,
    eventTypeId: '41c362cc-3bed-4707-97e3-732e8282',
    eventTypeName: {
      translation: {
        en: 'Flood',
        fr: 'Inondation',
      },
    },
    location: mockEventsData()[0].location,
    number: 1,
    provinceName: {
      translation: {
        en: 'Alberta',
        fr: 'Alberta FR',
      },
    },
    relatedEventsInfos: [{
      id: '87776243-696f-426b-b961-31ee98e3a4cd',
      eventName: {
        translation: {
          en: 'Vegas Earthquake 2021',
          fr: 'Vegas Earthquake 2021 FR',
        },
      },
    }],
    registrationLink: mockEventsData()[0].registrationLink,
    responseDetails: mockEventsData()[0].responseDetails,
    responseLevelName: {
      translation: {
        en: 'Level1',
        fr: 'Niveau1',
      },
    },
    selfRegistrationEnabled: false,
    schedule: {
      status: EEventStatus.Open,
      scheduledOpenDate: '2021-03-15T00:00:00Z',
      scheduledCloseDate: '2021-06-15T00:00:00Z',
      openDate: null,
      reOpenReason: '',
      hasBeenOpen: false,
      closeDate: null,
      closeReason: null,
    },
    scheduleEventStatusName: {
      translation: {
        en: 'On hold',
        fr: 'En attente',
      },
    },
    tenantId: '7c076603-580a-4400-bef2-5dde28582',
    callCentres: [],
    registrationLocations: [],
  },
];

export const mockSearchEvents = (index = -1): IAzureSearchResult<IEventSearchData> => {
  let value = mockEventsSearchData();
  if (index !== -1) {
    value = [mockEventsSearchData()[index]];
  }
  return {
    odataCount: 2,
    odataContext: 'context',
    value,
  };
};
