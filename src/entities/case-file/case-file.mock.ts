import { IAzureSearchResult } from '@/types';
import { ICaseFileData, ICaseFileSearchData } from './case-file.types';

export const mockCaseFilesSearchData = (): ICaseFileSearchData[] => [
  {
    caseFileId: 'mock-id-1',
    beneficiary: {
      id: 'mock-beneficiary-id-1',
      firstName: 'Jane',
      lastName: 'Doe',
      contactInformation: {
        email: 'Jane.doe@email.com',
        mobilePhoneNumber: {
          number: '(514) 123 4444',
          extension: '',
        },
        homePhoneNumber: null,
        alternatePhoneNumber: null,
      },
      homeAddress: {
        country: 'CA',
        streetAddress: 'Left str',
        unitSuite: '111',
        provinceCode: {
          translation: {
            en: 'QC',
            fr: 'QC',
          },
        },
        city: 'Montreal',
        postalCode: 'M4B 1G5',
      },
      householdMemberCount: 2,
    },
    caseFileNumber: '1-000001',
    caseFileStatusName: {
      translation: {
        en: 'Archived',
        fr: 'Archive',
      },
    },
    caseFileStatus: 4,
    caseFileCreatedDate: '2021-01-20T15:12:03.4219037Z',
    duplicate: false,
    event: {
      id: 'e70da37e-67cd-4afb-9c36-530c7d8b191f',
      name: {
        translation: {
          en: 'Event 1 EN',
          fr: 'Event 1 FR',
        },
      },
    },
    tags: [{
      id: 'mock-tag-id-1',
      name: {
        translation: {
          en: 'Do not communicate',
          fr: 'Ne pas contacter',
        },
      },
    }],
    labels: [{
      name: 'Label One',
      order: 1,
    }, {
      name: 'Label Two',
      order: 2,
    }],
    triage: 1,
    triageName: {
      translation: {
        en: 'Level 1',
        fr: 'Sans objet',
      },
    },
    tenantId: 'mock-tenant-id-1',
  },
  {
    caseFileId: 'mock-id-2',
    beneficiary: {
      id: 'mock-beneficiary-id-2',
      firstName: 'John',
      lastName: 'Wood',
      contactInformation: {
        email: 'john.wood@email.com',
        mobilePhoneNumber: {
          number: '(514) 123 4567',
          extension: '',
        },
        homePhoneNumber: null,
        alternatePhoneNumber: null,
      },
      homeAddress: {
        country: 'CA',
        streetAddress: 'Peel str',
        unitSuite: '111',
        provinceCode: {
          translation: {
            en: 'QC',
            fr: 'QC',
          },
        },
        city: 'Montreal',
        postalCode: 'M4B 1G5',
      },
      householdMemberCount: 2,
    },
    caseFileNumber: '2-000002',
    caseFileStatusName: {
      translation: {
        en: 'Open',
        fr: 'Ouvert',
      },
    },
    caseFileStatus: 2,
    caseFileCreatedDate: '2021-03-01',
    duplicate: true,
    event: {
      id: 'mock-event-id-2',
      name: {
        translation: {
          en: 'Event 2 EN',
          fr: 'Event 2 FR',
        },
      },
    },
    tags: [],
    labels: [{
      name: 'Label One',
      order: 1,
    }, {
      name: 'Label Two',
      order: 2,
    }],
    triage: 0,
    triageName: {
      translation: {
        en: 'Level 2',
        fr: 'Level 2 Fr',
      },
    },
    tenantId: 'mock-tenant-id-1',
  },
];

export const mockSearchCaseFiles = (index = -1): IAzureSearchResult<ICaseFileSearchData> => {
  let value = mockCaseFilesSearchData();
  if (index !== -1) {
    value = [mockCaseFilesSearchData()[index]];
  }
  return {
    odataCount: 2,
    odataContext: 'context',
    value,
  };
};

export const mockCaseFilesData = (): ICaseFileData[] => [{
  id: 'mock-id-1',
  beneficiaryId: 'mock-beneficiary-id-1',
  caseFileNumber: '1-000001',
  caseFileStatus: 1,
  created: '2021-01-01',
  duplicate: false,
  eventId: 'mock-event-id-1',
  tags: [],
  labels: [{
    name: 'Label One',
    order: 1,
  }, {
    name: 'Label Two',
    order: 2,
  }],
  triage: 0,
  eTag: 'mock-e-tag',
  tenantId: 'mock-tenant-id-1',
  timestamp: '2021-01-01',
}];
