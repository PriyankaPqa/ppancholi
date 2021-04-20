import { IAzureSearchResult } from '@/types';
import { ICaseFileData, ICaseFileSearchData } from './case-file.types';

export const mockCaseFilesSearchData = (): ICaseFileSearchData[] => [
  {
    caseFileId: 'mock-id-1',
    beneficiary: {
      id: 'mock-beneficiary-id-1',
      firstName: 'Jane',
      lastName: 'Doe',
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

export const mockSearchCaseFiles = (): IAzureSearchResult<ICaseFileSearchData> => ({
  odataCount: mockCaseFilesSearchData().length,
  odataContext: 'context',
  value: mockCaseFilesSearchData(),
});

export const mockCaseFilesData = (): ICaseFileData[] => [{
  id: 'mock-id-1',
  beneficiaryId: 'mock-beneficiary-id-1',
  caseFileNumber: '1-000001',
  caseFileStatus: 1,
  created: '2021-01-01',
  duplicate: false,
  eventId: 'mock-event-id-1',
  triage: 0,
  eTag: 'mock-e-tag',
  tenantId: 'mock-tenant-id-1',
  timestamp: '2021-01-01',
}];
