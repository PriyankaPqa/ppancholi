import { mockBaseData, IEntity } from '../base';
import { IOptionItem } from '../optionItem';
import { ICaseNoteCombined, ICaseNoteEntity, ICaseNoteMetadata } from './case-note.types';

export const mockCaseNoteCategories = (): IOptionItem[] => [
  {
    name: { translation: { en: 'Change in file status', fr: 'Changement à l’état du dossier' } },
    orderRank: 3,
    isOther: false,
    isDefault: false,
    restrictFinancial: false,
    subitems: [],
    ...mockBaseData({ id: '0a137a3f-ae72-4fab-b521-7f96da9ece12' }),
  },
  {
    name: { translation: { en: 'Assistance', fr: 'Assistance' } },
    description: null,
    orderRank: 2,
    isOther: false,
    isDefault: false,
    restrictFinancial: false,
    subitems: [],
    ...mockBaseData({ id: '39e3042d-0884-4505-9b18-2cf969706dfc' }),
  },
  {
    name: { translation: { en: 'Action logrterte', fr: 'Registre d’action au dossier' } },
    description: null,
    orderRank: 1,
    isOther: false,
    isDefault: false,
    restrictFinancial: false,
    subitems: [],
    ...mockBaseData({ id: '09bda590-ad8b-4f29-af4e-c63eedd337a0' }),
  },
  {
    name: { translation: { en: 'Other', fr: 'Autre' } },
    description: null,
    orderRank: 5,
    isOther: false,
    isDefault: false,
    restrictFinancial: false,
    subitems: [],
    ...mockBaseData({ id: '69a5d7c2-37ac-4326-ac42-2a661ffd9ab9' }),
  },
  {
    name: { translation: { en: 'Escalation', fr: 'Processus d’escalade' } },
    description: null,
    orderRank: 4,
    isOther: false,
    isDefault: false,
    restrictFinancial: false,
    subitems: [],
    id: '71d90801-9a9d-45fe-ae54-cb50a82afb7b',
    ...mockBaseData({ id: '71d90801-9a9d-45fe-ae54-cb50a82afb7b' }),
  },
  {
    name: { translation: { en: 'test thl en1', fr: 'test thl fr1' } },
    description: { translation: { en: 'desc en1', fr: 'desc fr1' } },
    orderRank: 7,
    isOther: false,
    isDefault: false,
    restrictFinancial: false,
    subitems: [],
    ...mockBaseData({ id: '47fb3c8a-02a8-4b39-b23f-bc4c0167e901' }),
  },
  {
    name: { translation: { en: "New Category for English é l'ê", fr: "New Category for English é l'ê FR" } },
    description: { translation: {} },
    orderRank: 11,
    isOther: false,
    isDefault: false,
    restrictFinancial: false,
    subitems: [],
    ...mockBaseData({ id: '067df21e-e9f8-4d49-9778-91a7b1ba74b9' }),
  },
];

export const mockCaseNoteEntity = (force? : Partial<ICaseNoteEntity>) : ICaseNoteEntity => ({
  ...mockBaseData(),
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
  userUpdatedBy: {
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
  updatedDate: new Date('0001-01-01T00:00:00'),
  ...force,
  validate: () => true,
});

export const mockCaseNoteMetadata = (force? : Partial<ICaseNoteMetadata>) : ICaseNoteMetadata => ({
  ...mockBaseData(),
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
  ...force,
});

export const mockCaseNoteEntities = () : ICaseNoteEntity[] => [
  mockCaseNoteEntity({ id: '1' }),
  mockCaseNoteEntity({ id: '2' }),
];

export const mockCaseNoteMetadatum = () : ICaseNoteMetadata[] => [
  mockCaseNoteMetadata({ id: '1' }),
  mockCaseNoteMetadata({ id: '2' }),
];

export const mockCombinedCaseNote = (force?: Partial<IEntity>): ICaseNoteCombined => ({
  metadata: mockCaseNoteMetadata(force),
  entity: mockCaseNoteEntity(force),
});

export const mockCombinedCaseNotes = (): ICaseNoteCombined[] => [
  mockCombinedCaseNote({ id: '1' }),
  mockCombinedCaseNote({ id: '2' }),
  mockCombinedCaseNote({ id: '3' }),
];
