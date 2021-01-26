import { ECanadaProvinces } from '@/types';
import { IEventData, IOtherProvince, IRegion } from './event.types';

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
      translation: {},
    },
    region: {
      translation: {},
    },
  },
  schedule: {
    status: 1,
    scheduledOpenDate: '2021-03-15T00:00:00Z',
    scheduledCloseDate: '2021-06-15T00:00:00Z',
    openDate: null,
    closeDate: null,
    closeReason: null,
  },
  responseDetails: {
    responseLevel: 3,
    eventType: '41c362cc-3bed-4707-97e3-732ef3a2ebbf',
    dateReported: '2021-01-01T00:00:00Z',
    assistanceNumber: '514 454 4545',
  },
  relatedEvents: [],
  id: '7c076603-580a-4400-bef2-5ddececb0931',
  created: '2021-01-20T15:12:03.4219037Z',
  timestamp: '2021-01-20T15:12:03.4230487Z',
  eTag: '"00004331-0000-0a00-0000-600848430000"',
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
    status: 1,
    scheduledOpenDate: '2021-03-01T00:00:00Z',
    scheduledCloseDate: null,
    openDate: null,
    closeDate: null,
    closeReason: null,
  },
  responseDetails: {
    responseLevel: 3,
    eventType: '41c362cc-3bed-4707-97e3-732ef3a2ebbf',
    dateReported: '2021-01-01T00:00:00Z',
    assistanceNumber: '514 454 4545',
  },
  relatedEvents: [],
  id: '87776243-696f-426b-b961-31ee98e3a4cd',
  created: '2021-01-20T15:45:52.2691443Z',
  timestamp: '2021-01-20T15:45:52.2699289Z',
  eTag: '*',
}];

export const mockOtherProvinceData = (): IOtherProvince[] => [{
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
}];

export const mockRegionData = (): IRegion[] => [{
  province: ECanadaProvinces.AB,
  name: {
    translation: {
      en: 'Northern Alberta',
      fr: 'Northern Alberta FR',
    },
  },
}, {
  province: ECanadaProvinces.AB,
  name: {
    translation: {
      en: 'Southern Alberta',
      fr: 'Southern Alberta FR',
    },
  },
}];
