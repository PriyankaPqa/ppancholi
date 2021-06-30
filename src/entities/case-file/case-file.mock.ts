/* eslint-disable max-lines-per-function */
import { IAzureSearchResult } from '@/types';
import { IOptionItem } from '../optionItem';
import {
  ECaseFileActivityType, ICaseFileData, ICaseFileSearchData, ICaseFileActivity,
} from './case-file.types';

export const mockCaseFilesSearchData = (): ICaseFileSearchData[] => [
  {
    caseFileId: 'mock-id-1',
    assignedIndividualIds: ['mock-assigned-individual-id-1', 'mock-assigned-individual-id-2'],
    assignedTeamIds: ['mock-assigned-team-id-1'],
    household: {
      id: 'mock-household-id-1',
      members: [],
      addressHistory: [],
      address: {
        address: {
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
        from: '',
        to: '',
      },
      primaryBeneficiary: {
        id: 'mock-beneficiary-id-1',
        identitySet: {
          firstName: 'Jane',
          middleName: 'Mary',
          lastName: 'Doe',
          preferredName: '',
          dateOfBirth: '',
        },
        contactInformation: {
          email: 'Jane.doe@email.com',
          mobilePhoneNumber: {
            number: '(514) 123 4444',
            extension: '',
          },
          homePhoneNumber: null,
          alternatePhoneNumber: null,
        },
      },
      houseHoldMemberCount: 1,
      registrationNumber: ' 123',
    },
    caseFileNumber: '1-000001',
    caseFileStatusName: {
      translation: {
        en: 'Archived',
        fr: 'Archive',
      },
    },
    lastActionDate: '2021-04-30',
    caseFileStatus: 4,
    caseFileCreatedDate: '2021-01-20T15:12:03.4219037Z',
    isDuplicate: false,
    event: {
      id: 'e70da37e-67cd-4afb-9c36-530c7d8b191f',
      name: {
        translation: {
          en: 'Event 1 EN',
          fr: 'Event 1 FR',
        },
      },
    },
    timestamp: '2021-04-30',
    tags: [
      {
        id: 'mock-tag-id-1',
        name: {
          translation: {
            en: 'Do not communicate',
            fr: 'Ne pas contacter',
          },
        },
      },
    ],
    labels: [
      {
        name: 'Label One',
        order: 1,
      },
      {
        name: 'Label Two',
        order: 2,
      },
    ],
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
    assignedIndividualIds: [],
    assignedTeamIds: [],
    household: {
      id: 'mock-household-id-2',
      members: [],
      addressHistory: [],
      address: {
        address: {
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
        from: '',
        to: '',
      },
      primaryBeneficiary: {
        id: 'mock-beneficiary-id-2',
        identitySet: {
          firstName: 'Jane',
          middleName: 'Mary',
          lastName: 'Doe',
          preferredName: '',
          dateOfBirth: '',
        },
        contactInformation: {
          email: 'Jane.doe@email.com',
          mobilePhoneNumber: {
            number: '(514) 123 4444',
            extension: '',
          },
          homePhoneNumber: null,
          alternatePhoneNumber: null,
        },
      },
      houseHoldMemberCount: 1,
      registrationNumber: ' 123',
    },
    caseFileNumber: '2-000002',
    caseFileStatusName: {
      translation: {
        en: 'Open',
        fr: 'Ouvert',
      },
    },
    lastActionDate: '2021-04-30',
    caseFileStatus: 2,
    caseFileCreatedDate: '2021-03-01',
    isDuplicate: true,
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
    timestamp: '2021-04-30',
    labels: [
      {
        name: 'Label One',
        order: 1,
      },
      {
        name: 'Label Two',
        order: 2,
      },
    ],
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

export const mockCaseFilesData = (): ICaseFileData[] => [
  {
    id: 'mock-id-1',
    assignedIndividualIds: [],
    assignedTeamIds: [],
    householdId: 'mock-beneficiary-id-1',
    caseFileNumber: '1-000001',
    caseFileStatus: 1,
    created: '2021-01-01',
    isDuplicate: false,
    eventId: 'mock-event-id-1',
    tags: [],
    labels: [
      {
        name: 'Label One',
        order: 1,
      },
      {
        name: 'Label Two',
        order: 2,
      },
    ],
    triage: 0,
    eTag: 'mock-e-tag',
    tenantId: 'mock-tenant-id-1',
    timestamp: '2021-01-01',
  },
];

export const mockCaseFileActivities = (type: ECaseFileActivityType = null): ICaseFileActivity[] => {
  const activities = [
    {
      id: 'mock-activity-id-1',
      caseFileId: 'mock-id-1',
      user: { id: '1', name: 'Jane Doe' },
      role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
      created: '2021-01-02 12:00',
      activityType: ECaseFileActivityType.AddedTag,
      details: {
        tags: [
          { id: 'tag-id-3', name: { translation: { en: 'tag 1', fr: 'tag 1 fr' } } },
          { id: 'tag-id-4', name: { translation: { en: 'Tag 2', fr: 'Tag 2 fr' } } },
        ],
      },
    },
    {
      id: 'mock-activity-id-2',
      caseFileId: 'mock-id-1',
      user: { id: '1', name: 'Jane Doe' },
      role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
      created: '2021-05-04',
      activityType: ECaseFileActivityType.RemovedTag,
      details: { tags: [{ id: 'tag-id-5', name: { translation: { en: 'tag 4', fr: 'tag 4 fr' } } }] },
    },
    {
      id: 'mock-activity-id-3',
      caseFileId: 'mock-id-1',
      user: { id: '1', name: 'Jane Doe' },
      role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
      created: '2021-05-04',
      activityType: ECaseFileActivityType.AddedDuplicateFlag,
      details: null,
    },
    {
      id: 'mock-activity-id-4',
      caseFileId: 'mock-id-1',
      user: { id: '1', name: 'Jane Doe' },
      role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
      created: '2021-05-04',
      activityType: ECaseFileActivityType.RemovedDuplicateFlag,
      details: null,
    },
    {
      id: 'mock-activity-id-5',
      caseFileId: 'mock-id-1',
      user: { id: '1', name: 'Jane Doe' },
      role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
      created: '2021-05-04',
      activityType: ECaseFileActivityType.CaseFileStatusDeactivated,
      details: {
        reason: {
          id: '5e26b639-1cdd-476f-8c1c-1eab255e5eb2',
          name: {
            translation: {
              en: 'Deceased',
              fr: 'Décès',
            },
          },
        },
        rationale: 'test',
      },
    },
    {
      id: 'mock-activity-id-6',
      caseFileId: 'mock-id-1',
      user: { id: '1', name: 'Jane Doe' },
      role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
      created: '2021-05-04',
      activityType: ECaseFileActivityType.CaseFileStatusClosed,
      details: {
        reason: {
          id: 'b5a484fb-eaa2-4d25-9dc5-c34a72e86100',
          name: {
            translation: {
              en: 'End of CRC support',
              fr: 'Fin du soutien de la CRC',
            },
          },
        },
        rationale: 'test',
      },
    },
    {
      id: 'mock-activity-id-7',
      caseFileId: 'mock-id-1',
      user: { id: '1', name: 'Jane Doe' },
      role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
      created: '2021-05-04',
      activityType: ECaseFileActivityType.CaseFileStatusArchived,
      details: null,
    },
    {
      id: 'mock-activity-id-8',
      caseFileId: 'mock-id-1',
      user: { id: '1', name: 'Jane Doe' },
      role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
      created: '2021-05-04',
      activityType: ECaseFileActivityType.CaseFileStatusReopened,
      details: {
        rationale: 'test',
      },
    },
    {
      id: 'mock-activity-id-9',
      caseFileId: 'mock-id-1',
      user: { id: '1', name: 'Jane Doe' },
      role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
      created: '2021-05-04',
      activityType: ECaseFileActivityType.TriageUpdated,
      details: { triageName: { translation: { en: 'Tier 1', fr: 'Categorie 1' } } },
    },
    {
      id: 'mock-activity-id-10',
      caseFileId: 'mock-id-1',
      user: { id: '1', name: 'Jane Doe' },
      role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
      created: '2021-05-04',
      activityType: ECaseFileActivityType.AssignedToCaseFile,
      details: {
        teams: [{ id: 'team-id-1', name: 'Team 1' }, { id: 'team-id-2', name: 'Team 2' }],
        individuals: [{ id: 'individual-id-1', name: 'John Stevenson' }, { id: 'individual-id-2', name: 'Steven Johnson' }],
      },
    },
    {
      id: 'mock-activity-id-11',
      caseFileId: 'mock-id-1',
      user: { id: '1', name: 'Jane Doe' },
      role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
      created: '2021-05-04',
      activityType: ECaseFileActivityType.UnassignedFromCaseFile,
      details: {
        teams: [{ id: 'team-id-1', name: 'Team 1' }, { id: 'team-id-2', name: 'Team 2' }],
        individuals: [{ id: 'individual-id-1', name: 'John Stevenson' }, { id: 'individual-id-2', name: 'Steven Johnson' }],
      },
    },
    {
      id: 'mock-activity-id-12',
      caseFileId: 'mock-id-1',
      user: { id: '1', name: 'Jane Doe' },
      role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
      created: '2021-05-04',
      activityType: ECaseFileActivityType.IdentityAuthenticationUpdated,
      details: {
        status: 1,
      },
    },
    {
      id: 'mock-activity-id-13',
      caseFileId: 'mock-id-1',
      user: { id: '1', name: 'Jane Doe' },
      role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
      created: '2021-05-04',
      activityType: ECaseFileActivityType.IdentityAuthenticationUpdated,
      details: {
        status: 2,
      },
    },
    {
      id: 'mock-activity-id-14',
      caseFileId: 'mock-id-1',
      user: { id: '1', name: 'Jane Doe' },
      role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
      created: '2021-05-04',
      activityType: ECaseFileActivityType.IdentityAuthenticationUpdated,
      details: {
        status: 0,
      },
    },
    {
      id: 'mock-activity-id-15',
      caseFileId: 'mock-id-1',
      role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
      user: { id: '1', name: 'Jane Doe' },
      created: '2021-05-04',
      activityType: ECaseFileActivityType.ImpactStatusValidationUpdated,
      details: {
        status: 1,
      },
    },
    {
      id: 'mock-activity-id-16',
      caseFileId: 'mock-id-1',
      user: { id: '1', name: 'Jane Doe' },
      role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
      created: '2021-05-04',
      activityType: ECaseFileActivityType.ImpactStatusValidationUpdated,
      details: {
        status: 2,
      },
    },
    {
      id: 'mock-activity-id-17',
      caseFileId: 'mock-id-1',
      role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
      user: { id: '1', name: 'Jane Doe' },
      created: '2021-05-04',
      activityType: ECaseFileActivityType.ImpactStatusValidationUpdated,
      details: {
        status: 0,
      },
    },
  ];

  if (type) {
    return activities.filter((a) => a.activityType === type);
  }

  return activities;
};

export const mockTagsOptions = (): IOptionItem[] => [
  {
    name: { translation: { en: 'tag option en', fr: 'tag option fr' } },
    orderRank: 3,
    isOther: false,
    isDefault: false,
    subitems: [],
    id: '0a137a3f-ae72-4fab-b521-7f96da9ece12',
    status: 1,
  },
];
