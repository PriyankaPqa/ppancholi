/* eslint-disable max-lines-per-function */
import { IEntity, mockBaseData } from '@/entities/base';
import { EEventStatus } from '@/entities/event';
import {
  ICaseFileMetadata,
  CaseFileActivityType, ICaseFileActivity, ICaseFileEntity, ICaseFileCombined, IdentityAuthenticationMethod, IdentityAuthenticationStatus,
  ValidationOfImpactStatus, ImpactValidationMethod, ICaseFileCount, ICaseFileDetailedCount, RegistrationType, HouseholdCaseFileActivityType,
} from './case-file.types';
import { IOptionItem } from '../optionItem';

export const mockCaseFileCount = (): ICaseFileCount => ({
  inactiveCount: 0, openCount: 1, closedCount: 1, archivedCount: 0,
});

export const mockCaseFileDetailedCount = (): ICaseFileDetailedCount => ({
  inactiveCount: 0,
  closedCount: 1,
  openCount: {
    assigned: 1,
    unAssigned: 2,
    duplicate: 3,
  },
  caseFileTriageCounts: {
    tier1: 1,
    tier2: 2,
    tier3: 3,
    tier4: 4,
    tier5: 5,
    tierNone: 8,
  },
});

export const mockCaseFileEntity = (force? : Partial<IEntity>): ICaseFileEntity => ({
  ...mockBaseData(),
  assignedIndividualIds: ['mock-assigned-individual-id-1', 'mock-assigned-individual-id-2'],
  assignedTeamIds: ['mock-assigned-team-id-1'],
  caseFileNumber: '1-000001',
  caseFileStatus: 4,
  eventId: 'e70da37e-67cd-4afb-9c36-530c7d8b191f',
  householdId: 'mock-household-id-1',
  impactStatusValidation: {
    status: ValidationOfImpactStatus.Impacted,
    method: ImpactValidationMethod.Manual,
  },
  isDuplicate: false,
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
  identityAuthentication: {
    identificationIds: [{ optionItemId: '1', specifiedOther: null }, { optionItemId: '2', specifiedOther: null }],
    method: IdentityAuthenticationMethod.InPerson,
    status: IdentityAuthenticationStatus.Passed,
  },
  ...force,
  validate: () => true,
  privacyDateTimeConsent: '2021-02-02',

});

export const mockCaseFileMetadata = (force? : Partial<ICaseFileMetadata>): ICaseFileMetadata => ({
  ...mockBaseData(),
  caseFileStatusName: {
    translation: {
      en: 'Archived',
      fr: 'Archive',
    },
  },
  event: {
    id: 'e70da37e-67cd-4afb-9c36-530c7d8b191f',
    name: {
      translation: {
        en: 'Event 1 EN',
        fr: 'Event 1 FR',
      },
    },
    status: EEventStatus.Open,
  },
  lastActionDate: '2021-04-30',
  triageName: {
    translation: {
      en: 'Level 1',
      fr: 'Sans objet',
    },
  },
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
  primaryBeneficiary: {
    id: '011a62da-0e21-478a-bb56-00b0b4845167',
    identitySet: {
      firstName: 'Ben 2',
      lastName: 'Test',
      dateOfBirth: '1990-01-01T00:00:00Z',
    },
    contactInformation: {
      email: null,
    },
  },
  household: {
    address: {
      address: {
        streetAddress: '312 Trudeau Drive',
        city: 'Milton',
        postalCode: 'L9T 6J1',
        country: 'CA',
        unitSuite: '',
        longitude: '45546',
        latitude: '54646',
        provinceCode: {
          translation: {
            en: 'ON',
            fr: 'ON',
          },
        },
      },
    },
  },
  appliedProgramIds: ['program-id-1'],
  identityAuthenticationStatusName: {
    translation: {
      en: 'Passed',
      fr: 'Passe',
    },
  },
  impactStatusValidationName: {
    translation: {
      en: 'Impacted',
      fr: 'Impacte',
    },
  },
  ...force,
});

export const mockCaseFileEntities = () : ICaseFileEntity[] => [
  mockCaseFileEntity({ id: '1' }),
  mockCaseFileEntity({ id: '2' }),
];

export const mockCaseFileMetadatum = () : ICaseFileMetadata[] => [
  mockCaseFileMetadata(),
  mockCaseFileMetadata(),
];

export const mockCombinedCaseFile = (force?: Partial<IEntity>, readonly = false): ICaseFileCombined => ({
  entity: mockCaseFileEntity(force),
  metadata: mockCaseFileMetadata(force),
  readonly,
});
export const mockCombinedCaseFiles = (): ICaseFileCombined[] => [
  mockCombinedCaseFile(),
  mockCombinedCaseFile(),
];

export const mockCaseFileActivities = (type: CaseFileActivityType = null): ICaseFileActivity[] => {
  const activities = [
    {
      id: 'mock-activity-id-1',
      caseFileId: 'mock-id-1',
      user: { id: '1', name: 'Jane Doe' },
      role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
      created: '2021-01-02 12:00',
      activityType: CaseFileActivityType.AddedTag,
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
      activityType: CaseFileActivityType.RemovedTag,
      details: { tags: [{ id: 'tag-id-5', name: { translation: { en: 'tag 4', fr: 'tag 4 fr' } } }] },
    },
    {
      id: 'mock-activity-id-3',
      caseFileId: 'mock-id-1',
      user: { id: '1', name: 'Jane Doe' },
      role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
      created: '2021-05-04',
      activityType: CaseFileActivityType.AddedDuplicateFlag,
      details: null,
    },
    {
      id: 'mock-activity-id-4',
      caseFileId: 'mock-id-1',
      user: { id: '1', name: 'Jane Doe' },
      role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
      created: '2021-05-04',
      activityType: CaseFileActivityType.RemovedDuplicateFlag,
      details: null,
    },
    {
      id: 'mock-activity-id-5',
      caseFileId: 'mock-id-1',
      user: { id: '1', name: 'Jane Doe' },
      role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
      created: '2021-05-04',
      activityType: CaseFileActivityType.CaseFileStatusDeactivated,
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
      activityType: CaseFileActivityType.CaseFileStatusClosed,
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
      activityType: CaseFileActivityType.CaseFileStatusArchived,
      details: null,
    },
    {
      id: 'mock-activity-id-8',
      caseFileId: 'mock-id-1',
      user: { id: '1', name: 'Jane Doe' },
      role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
      created: '2021-05-04',
      activityType: CaseFileActivityType.CaseFileStatusReopened,
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
      activityType: CaseFileActivityType.TriageUpdated,
      details: { triageName: { translation: { en: 'Tier 1', fr: 'Categorie 1' } } },
    },
    {
      id: 'mock-activity-id-10',
      caseFileId: 'mock-id-1',
      user: { id: '1', name: 'Jane Doe' },
      role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
      created: '2021-05-04',
      activityType: CaseFileActivityType.AssignedToCaseFile,
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
      activityType: CaseFileActivityType.UnassignedFromCaseFile,
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
      activityType: CaseFileActivityType.IdentityAuthenticationUpdated,
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
      activityType: CaseFileActivityType.IdentityAuthenticationUpdated,
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
      activityType: CaseFileActivityType.IdentityAuthenticationUpdated,
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
      activityType: CaseFileActivityType.ImpactStatusValidationUpdated,
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
      activityType: CaseFileActivityType.ImpactStatusValidationUpdated,
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
      activityType: CaseFileActivityType.ImpactStatusValidationUpdated,
      details: {
        status: 0,
      },
    },
    {
      id: 'mock-activity-id-18',
      caseFileId: 'mock-id-1',
      role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
      user: { id: '1', name: 'Jane Doe' },
      created: '2021-05-04',
      activityType: CaseFileActivityType.ReferralAdded,
      details: {
        name: 'Mental Health',
      },
    },
    {
      id: 'mock-activity-id-19',
      caseFileId: 'mock-id-1',
      role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
      user: { id: '1', name: 'Jane Doe' },
      created: '2021-05-04',
      activityType: CaseFileActivityType.ReferralUpdated,
      details: {
        name: 'Mental Health',
      },
    },
    {
      id: 'mock-activity-id-20',
      caseFileId: 'mock-id-1',
      role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
      user: { id: '1', name: 'Jane Doe' },
      created: '2021-05-04',
      activityType: CaseFileActivityType.DocumentDeactivated,
      details: {
        name: 'void_cheque_rbc.pdf',
      },
    },
    {
      id: 'mock-activity-id-21',
      caseFileId: 'mock-id-1',
      role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
      user: { id: '1', name: 'Jane Doe' },
      created: '2021-05-04',
      activityType: CaseFileActivityType.DocumentUpdated,
      details: {
        name: 'void_cheque_rbc.pdf',
      },
    },
    {
      id: 'mock-activity-id-22',
      caseFileId: 'mock-id-1',
      role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
      user: { id: '1', name: 'Jane Doe' },
      created: '2021-05-04',
      activityType: CaseFileActivityType.DocumentAdded,
      details: {
        name: 'void_cheque_rbc.pdf',
      },
    },
    {
      id: 'mock-activity-id-CaseNoteAdded',
      caseFileId: 'mock-id-1',
      role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
      user: { id: '1', name: 'Jane Doe' },
      created: '2021-05-04',
      activityType: CaseFileActivityType.CaseNoteAdded,
      details: {
        subject: 'abcd',
        caseNoteCategory: {
          id: '09bda590-ad8b-4f29-af4e-c63eedd337a0',
          name: {
            translation: {
              en: 'Action log',
              fr: 'Registre d’action au dossier',
            },
          },
        },
      },
    },
    {
      id: 'mock-activity-id-23',
      caseFileId: 'mock-id-1',
      role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
      user: { id: '1', name: 'Jane Doe' },
      created: '2021-05-04',
      activityType: CaseFileActivityType.CaseNoteUpdated,
      details: {
        subject: 'abc',
        caseNoteCategory: {
          id: '09bda590-ad8b-4f29-af4e-c63eedd337a0',
          name: {
            translation: {
              en: 'Escalation',
              fr: 'Processus d’escalade',
            },
          },
        },
      },
    },
    {
      id: 'mock-activity-id-24',
      caseFileId: 'mock-id-1',
      role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
      user: { id: '1', name: 'Jane Doe' },
      created: '2021-05-04',
      activityType: CaseFileActivityType.Registration,
      details: {
        registrationType: RegistrationType.Crc,
      },
    },
    {
      id: 'mock-activity-id-25',
      caseFileId: 'mock-id-1',
      role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
      user: { id: '1', name: 'Jane Doe' },
      created: '2021-05-04',
      activityType: CaseFileActivityType.Registration,
      details: {
        registrationType: RegistrationType.Public,
      },
    },
    {
      id: 'mock-activity-id-26',
      caseFileId: 'mock-id-1',
      role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
      user: { id: '1', name: 'Jane Doe' },
      created: '2021-05-04',
      activityType: CaseFileActivityType.PaymentSubmitted,
      details: {
        paymentName: 'Add Pyament Submitted',
        totalAmount: 10.10,
      },
    },
    {
      id: 'mock-activity-id-27',
      caseFileId: 'mock-id-1',
      role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
      user: { id: '1', name: 'Jane Doe' },
      created: '2021-05-04',
      activityType: CaseFileActivityType.HouseholdEdited,
      details: { householdActivityType: HouseholdCaseFileActivityType.MemberAdded, member: { id: '123', name: 'John Smith' } },
    },
    {
      id: 'mock-activity-id-28',
      caseFileId: 'mock-id-1',
      role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
      user: { id: '1', name: 'Jane Doe' },
      created: '2021-05-04',
      activityType: CaseFileActivityType.HouseholdSplit,
      details: {
        removedMembers: [
          {
            id: '61016652-3939-41fc-99a6-b4ca2c790254',
            name: 'firstname1 lastname',
          },
          {
            id: '61016652-3939-41fc-99a6-b4ca2c790252',
            name: 'firstname2 lastname',
          },
        ],
      },
    },
    {
      id: 'mock-activity-id-29',
      caseFileId: 'mock-id-1',
      role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
      user: { id: '1', name: 'Jane Doe' },
      created: '2021-05-04',
      activityType: CaseFileActivityType.HouseholdMovedMembersOut,
      details: {
        members: [
          {
            id: '61016652-3939-41fc-99a6-b4ca2c790254',
            name: 'firstname1 lastname',
          },
          {
            id: '61016652-3939-41fc-99a6-b4ca2c790252',
            name: 'firstname2 lastname',
          },
        ],
      },
    },
    {
      id: 'mock-activity-id-30',
      caseFileId: 'mock-id-1',
      role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
      user: { id: '1', name: 'Jane Doe' },
      created: '2021-05-04',
      activityType: CaseFileActivityType.HouseholdMovedMembersIn,
      details: {
        members: [
          {
            id: '61016652-3939-41fc-99a6-b4ca2c790254',
            name: 'firstname1 lastname',
          },
          {
            id: '61016652-3939-41fc-99a6-b4ca2c790252',
            name: 'firstname2 lastname',
          },
        ],
      },
    },
    {
      id: 'mock-activity-id-31',
      caseFileId: 'mock-id-1',
      role: { id: '2', name: { translation: { en: 'sys admin', fr: 'admin de systeme' } } },
      user: { id: '1', name: 'Jane Doe' },
      created: '2021-05-04',
      activityType: CaseFileActivityType.HouseholdCreatedAfterSplit,
      details: {
        removedMembers: [
          {
            id: '61016652-3939-41fc-99a6-b4ca2c790254',
            name: 'firstname1 lastname',
          },
          {
            id: '61016652-3939-41fc-99a6-b4ca2c790252',
            name: 'firstname2 lastname',
          },
        ],
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
    ...mockBaseData(),
    name: { translation: { en: 'tag option en', fr: 'tag option fr' } },
    orderRank: 3,
    isOther: false,
    isDefault: false,
    subitems: [],
  },
];
