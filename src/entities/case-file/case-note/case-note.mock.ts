import { IAzureSearchResult } from '@/types';
import { IOptionItem } from '../../optionItem';
import { CaseNote } from './case-note';
import { ICaseNote, ICaseNoteData, ICaseNoteSearchData } from './case-note.types';

export const mockCaseNoteCategories = (): IOptionItem[] => [
  {
    name: { translation: { en: 'Change in file status', fr: 'Changement à l’état du dossier' } },
    orderRank: 3,
    isOther: false,
    isDefault: false,
    subitems: [],
    id: '0a137a3f-ae72-4fab-b521-7f96da9ece12',
    status: 1,
  },
  {
    name: { translation: { en: 'Assistance', fr: 'Assistance' } },
    description: null,
    orderRank: 2,
    isOther: false,
    isDefault: false,
    subitems: [],
    id: '39e3042d-0884-4505-9b18-2cf969706dfc',
    status: 1,
    eTag: '"0900cd2f-0000-0a00-0000-609ed58b0000"',
  },
  {
    name: { translation: { en: 'Action logrterte', fr: 'Registre d’action au dossier' } },
    description: null,
    orderRank: 1,
    isOther: false,
    isDefault: false,
    subitems: [],
    id: '09bda590-ad8b-4f29-af4e-c63eedd337a0',
    status: 1,
    eTag: '"0b002262-0000-0a00-0000-60a268d40000"',
  },
  {
    name: { translation: { en: 'Other', fr: 'Autre' } },
    description: null,
    orderRank: 5,
    isOther: false,
    isDefault: false,
    subitems: [],
    id: '69a5d7c2-37ac-4326-ac42-2a661ffd9ab9',
    status: 1,
    eTag: '"0900cf2f-0000-0a00-0000-609ed58b0000"',
  },
  {
    name: { translation: { en: 'Escalation', fr: 'Processus d’escalade' } },
    description: null,
    orderRank: 4,
    isOther: false,
    isDefault: false,
    subitems: [],
    id: '71d90801-9a9d-45fe-ae54-cb50a82afb7b',
    status: 1,
    eTag: '"0900d02f-0000-0a00-0000-609ed58b0000"',
  },
  {
    name: { translation: { en: 'test thl en1', fr: 'test thl fr1' } },
    description: { translation: { en: 'desc en1', fr: 'desc fr1' } },
    orderRank: 7,
    isOther: false,
    isDefault: false,
    subitems: [],
    id: '47fb3c8a-02a8-4b39-b23f-bc4c0167e901',
    status: 1,
    eTag: '"0b001262-0000-0a00-0000-60a268d00000"',
  },
  {
    name: { translation: { en: "New Category for English é l'ê", fr: "New Category for English é l'ê FR" } },
    description: { translation: {} },
    orderRank: 11,
    isOther: false,
    isDefault: false,
    subitems: [],
    id: '067df21e-e9f8-4d49-9778-91a7b1ba74b9',
    status: 1,
    eTag: '"09009c33-0000-0a00-0000-609ed8b40000"',
  },
];

export const mockCaseNoteData = (): ICaseNoteData[] => [
  {
    caseFileId: '38106287-9046-47b9-8981-76ede656d305',
    subject: 'test subject',
    description: 'test desc',
    category: {
      optionItemId: '09bda590-ad8b-4f29-af4e-c63eedd337a0',
      specifiedOther: null,
    },
    userCreatedBy: {
      userId: '9875ba14-8790-4db3-983a-139057c69ea6',
      userName: 'Thi Hung Lieu',
      roleId: '58ff083e-b3d2-55af-705a-5db5619806c3',
      roleName: {
        translation: {
          en: 'Level 6',
          fr: 'Niveau 6',
        },
      },
    },
    isPinned: false,
  },
  {
    caseFileId: '38106287-9046-47b9-8981-76ede656d305',
    subject: 'test subject 2',
    description: 'test desc',
    category: {
      optionItemId: '09bda590-ad8b-4f29-af4e-c63eedd337a0',
      specifiedOther: null,
    },
    userCreatedBy: {
      userId: '9875ba14-8790-4db3-983a-139057c69ea6',
      userName: 'Thi Hung Lieu',
      roleId: '58ff083e-b3d2-55af-705a-5db5619806c3',
      roleName: {
        translation: {
          en: 'Level 6',
          fr: 'Niveau 6',
        },
      },
    },
    isPinned: true,
  },
];

export const mockCaseNoteSearchData = (): ICaseNoteSearchData[] => [
  {
    id: '98cc878d-a6c6-4bd2-ac06-8db381d292c0',
    caseFileId: '38106287-9046-47b9-8981-76ede656d305',
    tenantId: 'c400f50d-7a56-4ef2-8e44-211bfa434724',
    subject: 'test subject',
    description: 'test desc',
    caseNoteCategoryId: '0a137a3f-ae72-4fab-b521-7f96da9ece12',
    caseNoteCategoryName: {
      translation: {
        en: 'Action log',
        fr: 'Registre d\u2019action au dossier',
      },
    },
    createdBy: {
      userName: 'Thi Hung Lieu',
      roleName: {
        translation: {
          en: 'Level 6',
          fr: 'Niveau 6',
        },
      },
    },
    updatedBy: {
      userName: 'updated by user',
    },
    caseNoteCreatedDate: '2021-05-25T19:53:36.6898336Z',
    caseNoteUpdatedDate: '2021-05-26T14:35:30.4529931Z',
    caseNoteStatusName: {
      translation: {
        en: 'Active',
        fr: 'Actif',
      },
    },
    isPinned: false,
  },
  {
    id: '0c390599-219d-4b8c-9fd0-49557d7a17e2',
    caseFileId: '793ad408-17e8-4ce4-a3c9-6242f6fb5179',
    tenantId: 'c400f50d-7a56-4ef2-8e44-211bfa434724',
    subject: '33',
    description: 'fgdg',
    caseNoteCategoryId: '71d90801-9a9d-45fe-ae54-cb50a82afb7b',
    isPinned: false,
    caseNoteCreatedDate: '2021-06-04T16:01:06.5213921Z',
    caseNoteUpdatedDate: '0001-01-01T00:00:00',
    caseNoteStatusName: {
      translation: {
        en: 'Active',
        fr: 'Actif',
      },
    },
    caseNoteCategoryName: {
      translation: {
        en: 'Escalation',
        fr: 'Processus d\\u2019escalade',
      },
    },
    createdBy: {
      userName: 'user name',
      roleName: {
        translation: {
          en: 'System Admin',
          fr: 'Administrateur(-trice) de syst\\u00e8me',
        },
      },
    },
    updatedBy: null,
  },
];

export const mockSearchCaseNotes = (): IAzureSearchResult<ICaseNoteSearchData> => ({
  odataCount: 2,
  odataContext: 'context',
  value: mockCaseNoteSearchData(),
});

export const mockCaseNote = (): ICaseNote => new CaseNote(mockCaseNoteSearchData()[0]);

export const mockCaseNotes = (): ICaseNote[] => mockCaseNoteSearchData().map((c) => new CaseNote(c));
