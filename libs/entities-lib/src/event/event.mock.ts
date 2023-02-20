import { ECanadaProvinces, IMultilingual, IAzureSearchResult } from '@libs/shared-lib/types';
import { IEntity, mockBaseData, Status } from '../base';
import {
  IEventMainInfo,
  EEventCallCentreStatus,
  EEventStatus,
  IEventCombined,
  IEventEntity,
  IEventMetadata,
  IEventLocation,
} from './event.types';
/* eslint-disable max-lines-per-function */

export const mockRegistrationAssessment = () => ({
  ...mockBaseData(),
  id: '1dea3c36-d6a5-4e6c-ac36-078677b7d212',
  assessmentId: '1dea3c36-d6a5-4e6c-ac36-078677b7d210',
  details: { translation: { en: 'detail en', fr: 'detail fr' } },
  sectionTitle: { translation: { en: 'title en', fr: 'title fr' } },
});
export const mockEventMainInfo = (force?: Partial<IEventMainInfo>): IEventMainInfo => ({
  entity: {
    id: '1dea3c36-d6a5-4e6c-ac36-078677b7d111',
    name: {
      translation: {
        en: 'Gatineau Floods 2021',
        fr: 'Inondations Gatineau 2021',
      },
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
    registrationLink: {
      translation: {
        en: 'https://www.redcross.ca/gatineau-floods-2021',
        fr: 'https://www.redcross.ca/inondations-gatineau-2021',
      },
    },
    tenantId: '1dea3c36-d6a5-4e6c-ac36-078677b7d112',
    registrationLocations: [],
    shelterLocations: [],
    selfRegistrationEnabled: true,
    schedule: {
      status: EEventStatus.Open,
      scheduledOpenDate: '2021-03-31T00:00:00Z',
      scheduledCloseDate: '2021-05-31T00:00:00Z',
      openDate: '2021-03-31T15:23:00.755Z',
      closeDate: null,
      updateReason: null,
      timestamp: '2021-03-31T15:23:00.755Z',
    },
    ...force,
  },
});

// eslint-disable-next-line max-lines-per-function
export const mockEventEntityData = (): IEventEntity[] => [
  {
    ...mockBaseData(),
    id: '1dea3c36-d6a5-4e6c-ac36-078677b7d111',
    validate: null,
    fillEmptyMultilingualAttributes: null,

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
    number: 1,
    selfRegistrationEnabled: false,
    assessmentsForL0usersEnabled: false,
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
      scheduledOpenDate: '2021-03-01T00:00:00Z',
      scheduledCloseDate: '2021-05-15T15:00:00Z',
      openDate: '2021-03-31T15:23:00.755Z',
      closeDate: '2021-03-31T15:23:09.367Z',
      updateReason: 'For reasons',
      timestamp: '2021-03-31T15:23:16.069Z',
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
    registrationAssessments: [
     mockRegistrationAssessment(),
    ],
    registrationLocations: [
      {
        id: 'registration-location-1',
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
          specifiedOtherProvince: null,
          city: 'test',
          postalCode: 'h2k2k2',
        },
      }, {
        id: 'registration-location-2',
        name: {
          translation: {
            en: 'registration test',
            fr: 'registration test',
          },
        },
        status: 1,
        address: {
          country: 'CA',
          streetAddress: '5150 Yonge Street',
          unitSuite: null,
          province: 9,
          specifiedOtherProvince: null,
          city: 'Toronto',
          postalCode: 'M2N 6L7',
        },
      }],
    callCentres: [
      {
        id: 'call-centre-1',
        name: {
          translation: {
            en: 'z call center 1',
            fr: 'call center 1 fr',
          },
        },
        startDate: '2021-03-01T00:00:00.000Z',
        endDate: null,
        status: EEventCallCentreStatus.Active,
        details: {
          translation: {
            en: 'call center 1 details',
            fr: 'call center 1  details fr',
          },
        },
      },
      {
        id: 'call-centre-2',
        name: {
          translation: {
            en: 'call center 2',
            fr: 'call center 2 fr',
          },
        },
        startDate: '2021-03-01T00:00:00.000Z',
        endDate: null,
        status: EEventCallCentreStatus.Active,
        details: {
          translation: {
            en: 'call center 1 details',
            fr: 'call center 1  details fr',
          },
        },
      },
    ],
    scheduleHistory: [
      {
        status: EEventStatus.Open,
        scheduledOpenDate: '2021-03-31T00:00:00Z',
        scheduledCloseDate: '2021-05-31T00:00:00Z',
        openDate: '2021-03-31T15:23:00.755Z',
        closeDate: null,
        updateReason: null,
        timestamp: '2021-03-31T15:23:00.755Z',
      },
      {
        status: EEventStatus.Closed,
        scheduledOpenDate: '2021-03-31T00:00:00Z',
        scheduledCloseDate: '2021-05-31T00:00:00Z',
        openDate: '2021-03-31T15:23:00.755Z',
        closeDate: '2021-03-31T15:23:09.367Z',
        updateReason: 'Close Reason',
        timestamp: '2021-03-31T15:23:09.367Z',
      },
      {
        status: EEventStatus.Archived,
        scheduledOpenDate: '2021-03-31T00:00:00Z',
        scheduledCloseDate: '2021-05-31T00:00:00Z',
        openDate: '2021-03-31T15:23:00.755Z',
        closeDate: '2021-03-31T15:23:09.367Z',
        updateReason: null,
        timestamp: '2021-03-31T15:23:13.508Z',
      },
      {
        status: EEventStatus.OnHold,
        scheduledOpenDate: null,
        scheduledCloseDate: null,
        openDate: '2021-03-31T15:23:00.755Z',
        closeDate: '2021-03-31T15:23:09.367Z',
        updateReason: null,
        timestamp: '2021-03-31T15:23:16.069Z',
      },
    ],
    shelterLocations: [
      {
        id: 'shelter-id-1',
        name: {
          translation: {
            en: 'shelter en',
            fr: 'shelter fr rt',
          },
        },
        status: 2,
        address: {
          country: 'CA',
          streetAddress: '2295 Rue Bercy',
          unitSuite: null,
          province: 11,
          specifiedOtherProvince: null,
          city: 'Montréal',
          postalCode: 'H2K 2V6',
        },
      },
      {
        id: 'shelter-id-2',
        name: {
          translation: {
            en: 'shelter 1 en',
            fr: 'shelter 1 fr',
          },
        },
        status: 1,
        address: {
          country: 'CA',
          streetAddress: '5157 Avenue de Courtrai',
          unitSuite: null,
          province: 11,
          specifiedOtherProvince: null,
          city: 'Montréal',
          postalCode: 'H3W 0A9',
        },
      },
    ],
    eventStatus: EEventStatus.Open,
    relatedEventIds: [],
    agreements: [{
      id: 'agreement-id-1',
      name: {
        translation: {
          en: 'agreement 1',
          fr: 'agreement 1 fr',
        },
      },
      startDate: '2021-03-01T00:00:00Z',
      endDate: null,
      agreementType: {
        optionItemId: '1',
        specifiedOther: 'abc',
      },
      details: {
        translation: {
          en: 'agreement 1 details',
          fr: 'agreement 1  details fr',
        },
      },
    }],
  },
  {
    ...mockBaseData(),
    id: '1dea3c36-d6a5-4e6c-ac36-078677b7d222',
    validate: null,
    fillEmptyMultilingualAttributes: null,

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
      scheduledOpenDate: '2021-03-31T00:00:00Z',
      scheduledCloseDate: '2021-05-31T00:00:00Z',
      openDate: '2021-03-31T15:23:00.755Z',
      closeDate: null,
      updateReason: null,
      timestamp: '2021-03-31T15:23:00.755Z',
    },
    scheduleHistory: [{
      status: EEventStatus.Open,
      scheduledOpenDate: '2021-03-31T00:00:00Z',
      scheduledCloseDate: '2021-05-31T00:00:00Z',
      openDate: '2021-03-31T15:23:00.755Z',
      closeDate: null,
      updateReason: null,
      timestamp: '2021-03-31T15:23:00.755Z',
    }],
    responseDetails: {
      responseLevel: 3,
      eventType: {
        optionItemId: '41c362cc-3bed-4707-97e3-732ef3a2ebbf',
        specifiedOther: '',
      },
      dateReported: '2021-01-01T00:00:00Z',
      assistanceNumber: '+15144544545',
    },
    created: '2021-01-20T15:45:52.2691443Z',
    timestamp: '2021-01-20T15:45:52.2699289Z',
    callCentres: [
      {
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
    registrationLocations: [
      {
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
          specifiedOtherProvince: null,
          city: 'test',
          postalCode: 'h2k2k2',
        },
      }, {
        name: {
          translation: {
            en: 'registration test',
            fr: 'registration test',
          },
        },
        status: 1,
        address: {
          country: 'CA',
          streetAddress: '5150 Yonge Street',
          unitSuite: null,
          province: 9,
          specifiedOtherProvince: null,
          city: 'Toronto',
          postalCode: 'M2N 6L7',
        },
      }],
    selfRegistrationEnabled: false,
    assessmentsForL0usersEnabled: false,
    shelterLocations: [
      {
        id: 'shelter-id-1',
        name: {
          translation: {
            en: 'shelter en',
            fr: 'shelter fr rt',
          },
        },
        status: 2,
        address: {
          country: 'CA',
          streetAddress: '2295 Rue Bercy',
          unitSuite: null,
          province: 11,
          specifiedOtherProvince: null,
          city: 'Montréal',
          postalCode: 'H2K 2V6',
        },
      },
    ],
    eventStatus: EEventStatus.Open,
    relatedEventIds: [],
    agreements: [{
      name: {
        translation: {
          en: 'agreement 2',
          fr: 'agreement 2 fr',
        },
      },
      startDate: '2021-03-01T00:00:00Z',
      endDate: null,
      agreementType: {
        optionItemId: '1',
        specifiedOther: 'abc',
      },
      details: {
        translation: {
          en: 'agreement 2 details',
          fr: 'agreement 2  details fr',
        },
      },
    }],
  },
];

export const mockEventMetadataData = (): IEventMetadata[] => [
  {
    ...mockBaseData(),
    id: '1dea3c36-d6a5-4e6c-ac36-078677b7d111',
    eventTypeId: '41c362cc-3bed-4707-97e3-732ef3a2ebbf',
    agreements: [{
      name: {
        translation: {
          en: 'agreement 1',
          fr: 'agreement 1 fr',
        },
      },
      startDate: '2021-03-01T00:00:00Z',
      endDate: null,
      agreementType: {
        optionItemId: '1',
        specifiedOther: 'abc',
      },
      agreementTypeName: {
        translation: {
          en: 'agreement type 1',
          fr: 'agreement type 1 fr',
        },
      },
      details: {
        translation: {
          en: 'agreement 1 details',
          fr: 'agreement 1  details fr',
        },
      },
    }],
    eventTypeName: {
      translation: {
        en: 'Flood',
        fr: 'Inondation',
      },
    },
    scheduleEventStatusName: {
      translation: {
        en: 'On hold',
        fr: 'En attente',
      },
    },
    provinceName: {
      translation: {
        en: 'Alberta',
        fr: 'Alberta FR',
      },
    },
    teamMemberIds: [
      '1dea3c36-d6a5-4e6c-ac36-078677b7aaaa',
      '1dea3c36-d6a5-4e6c-ac36-078677b7bbbb',
      '1dea3c36-d6a5-4e6c-ac36-078677b7cccc',
    ],
    responseLevelName: {
      translation: {
        en: 'Level1',
        fr: 'Niveau1',
      },
    },
  },
  {
    ...mockBaseData(),
    id: '1dea3c36-d6a5-4e6c-ac36-078677b7d222',
    eventTypeId: '41c362cc-3bed-4707-97e3-732ef3a2ebbf',
    agreements: [{
      name: {
        translation: {
          en: 'agreement 2',
          fr: 'agreement 2 fr',
        },
      },
      startDate: '2021-03-01T00:00:00Z',
      endDate: null,
      agreementType: {
        optionItemId: '1',
        specifiedOther: 'abc',
      },
      agreementTypeName: {
        translation: {
          en: 'agreement type 2',
          fr: 'agreement type 2 fr',
        },
      },
      details: {
        translation: {
          en: 'agreement 2 details',
          fr: 'agreement 2  details fr',
        },
      },
    }],
    eventTypeName: {
      translation: {
        en: 'Flood',
        fr: 'Inondation',
      },
    },
    scheduleEventStatusName: {
      translation: {
        en: 'On hold',
        fr: 'En attente',
      },
    },
    provinceName: {
      translation: {
        en: 'Alberta',
        fr: 'Alberta FR',
      },
    },
    teamMemberIds: [
      '1dea3c36-d6a5-4e6c-ac36-078677b7aaaa',
      '1dea3c36-d6a5-4e6c-ac36-078677b7bbbb',
      '1dea3c36-d6a5-4e6c-ac36-078677b7cccc',
    ],
    responseLevelName: {
      translation: {
        en: 'Level1',
        fr: 'Niveau1',
      },
    },
  },
];

export const mockOtherProvinceData = (): IEventLocation[] => [{
  province: ECanadaProvinces.OT,
  provinceOther: {
    translation: {
      en: 'New York',
      fr: 'New York FR',
    },
  },
  region: null,
}, {
  province: ECanadaProvinces.OT,
  provinceOther: {
    translation: {
      en: 'California',
      fr: 'Californie',
    },
  },
  region: null,
}];

export const mockRegionData = (): IEventLocation[] => [{
  province: ECanadaProvinces.AB,
  region: {
    translation: {
      en: 'Southern Alberta',
      fr: 'Southern Alberta FR',
    },
  },
  provinceOther: null,
}, {
  province: ECanadaProvinces.AB,
  region: {
    translation: {
      en: 'Northern Alberta',
      fr: 'Northern Alberta FR',
    },
  },
  provinceOther: null,
}];

const getEventEntity = (index = 0) : IEventEntity => ({
  ...mockBaseData(),
  id: mockBaseData().id + index,
  number: 123 + index,
  selfRegistrationEnabled: mockEventEntityData()[index].selfRegistrationEnabled,
  assessmentsForL0usersEnabled: mockEventEntityData()[index].assessmentsForL0usersEnabled,
  eventStatus: mockEventEntityData()[index].eventStatus,
  name: mockEventEntityData()[index].name,
  description: mockEventEntityData()[index].description,
  registrationLink: mockEventEntityData()[index].registrationLink,
  location: mockEventEntityData()[index].location,
  schedule: mockEventEntityData()[index].schedule,
  responseDetails: mockEventEntityData()[index].responseDetails,
  registrationAssessments: mockEventEntityData()[index].registrationAssessments,
  registrationLocations: mockEventEntityData()[index].registrationLocations,
  shelterLocations: mockEventEntityData()[index].shelterLocations,
  callCentres: mockEventEntityData()[index].callCentres,
  scheduleHistory: mockEventEntityData()[index].scheduleHistory,
  relatedEventIds: [mockBaseData().id + (index + 1)],
  agreements: mockEventEntityData()[index].agreements,

  validate: jest.fn(),
  fillEmptyMultilingualAttributes: jest.fn(),
});

const getEventMetadatum = (index = 0) : IEventMetadata => ({
  ...mockBaseData(),
  teamMemberIds: [],
  eventTypeId: mockEventMetadataData()[index].eventTypeId,
  agreements: mockEventMetadataData()[index].agreements,
  eventTypeName: mockEventMetadataData()[index].eventTypeName,
  scheduleEventStatusName: mockEventMetadataData()[index].scheduleEventStatusName,
  provinceName: mockEventMetadataData()[index].provinceName,
  responseLevelName: mockEventMetadataData()[index].responseLevelName,
});

export const mockEventEntity = (force?: Partial<IEventEntity>, index = 0) : IEventEntity => ({
  ...mockBaseData(),
  ...getEventEntity(index),
  eventStatus: EEventStatus.Open,
  ...force,
});

export const mockEventMetadatum = (force?: Partial<IEventMetadata>, index = 0) : IEventMetadata => ({
  ...mockBaseData(),
  ...getEventMetadatum(index),
  ...force,
});

export const mockEmptyBaseData = () => ({
  id: null as uuid,
  tenantId: null as uuid,
  created: null as string,
  timestamp: null as string,
  status: null as Status,
  createdBy: null as string,
  lastUpdatedBy: null as string,
  lastAction: null as string,
  lastActionCorrelationId: null as string,
});

export const emptyMultilingual = () : IMultilingual => (
  {
    translation: {
      en: null,
      fr: null,
    },
  }
);

export const mockEmptyEntity = (force?: Partial<IEventEntity>) : IEventEntity => (
  {
    ...mockEmptyBaseData(),
    id: null,
    validate: null,
    fillEmptyMultilingualAttributes: null,
    number: null,
    name: emptyMultilingual(),
    description: emptyMultilingual(),
    registrationLink: emptyMultilingual(),
    location: {
      province: null,
      provinceOther: emptyMultilingual(),
      region: emptyMultilingual(),
    },
    schedule: {
      status: null,
      scheduledOpenDate: null,
      scheduledCloseDate: null,
      openDate: null,
      closeDate: null,
      updateReason: null,
      timestamp: null,
    },
    scheduleHistory: [],
    responseDetails: {
      responseLevel: null,
      eventType: {
        optionItemId: null,
        specifiedOther: null,
      },
      dateReported: null,
      assistanceNumber: null,
    },
    created: null,
    timestamp: null,
    callCentres: [],
    registrationLocations: [],
    selfRegistrationEnabled: false,
    assessmentsForL0usersEnabled: false,
    shelterLocations: [],
    eventStatus: null,
    relatedEventIds: [],
    agreements: [],
    ...force,
  }
);

export const mockEmptyMetadata = (force?: Partial<IEventMetadata>) : IEventMetadata => (
  {
    ...mockEmptyBaseData(),
    teamMemberIds: [],
    eventTypeId: null,
    eventTypeName: emptyMultilingual(),
    agreements: [],
    scheduleEventStatusName: emptyMultilingual(),
    provinceName: emptyMultilingual(),
    responseLevelName: emptyMultilingual(),
    ...force,
  }
);

export const mockEventEntities = () : IEventEntity[] => [
  mockEventEntity({ id: '1', relatedEventIds: ['2'] }),
  mockEventEntity({ id: '2', eventStatus: EEventStatus.Closed }, 1),
];

export const mockEventMetadata = () : IEventMetadata[] => [
  mockEventMetadatum({ id: '1' }),
  mockEventMetadatum({ id: '2' }, 1),
];

export const mockCombinedEvent = (force?: Partial<IEntity>, index?: number): IEventCombined => ({
  entity: mockEventEntity(force, index),
  metadata: mockEventMetadatum(force, index),
});

export const mockEmptyCombinedEvent = (force?: Partial<IEntity>): IEventCombined => ({
  entity: mockEmptyEntity(force),
  metadata: mockEmptyMetadata(force),
});

export const mockCombinedEvents = (): IEventCombined[] => [
  mockCombinedEvent({ id: '1' }),
  mockCombinedEvent({ id: '2' }, 1),
];

export const mockSearchEventEntity = (): IAzureSearchResult<IEventEntity> => ({
  odataCount: 2,
  odataContext: 'context',
  value: mockEventEntities(),
});
