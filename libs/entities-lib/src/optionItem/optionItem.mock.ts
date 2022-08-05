import { mockBaseData, Status } from '../base';
import {
  IOptionItem, IOptionItemCombined, IOptionItemData, IOptionSubItem,
} from './optionItem.types';

export const mockOptionSubItem = (force?: Partial<IOptionSubItem>): IOptionSubItem => ({
  ...mockBaseData(),
  name: {
    translation: {
      en: 'case worker 2',
      fr: 'case worker 2 fr',
    },
  },
  orderRank: 1,
  isOther: false,
  isDefault: false,
  description: {
    translation: {
      en: 'case worker 2 description',
      fr: 'case worker 2 description fr',
    },
  },
  ...force,
});

export const mockOptionItemData = (): IOptionItemData[] => [
  {
    ...mockBaseData({ id: '1' }),
    name: {
      translation: {
        en: 'Flood',
        fr: 'Inundation',
      },
    },
    description: {
      translation: {
        en: 'This is item 1 description',
        fr: 'This is item 1 description FR',
      },
    },
    orderRank: 2,
    status: 1,
    isOther: true,
    isDefault: false,
    subitems: [mockOptionSubItem({ id: '1' }), mockOptionSubItem({ id: '2' })],
  },
  {
    ...mockBaseData({ id: '2' }),
    name: {
      translation: {
        en: 'Wildfire',
        fr: 'Incendies',
      },
    },
    description: {
      translation: {
        en: 'This is item 1 description',
        fr: 'This is item 1 description FR',
      },
    },
    orderRank: 3,
    status: 1,
    isOther: false,
    isDefault: true,
    subitems: [],
  },

  {
    ...mockBaseData(),
    name: {
      translation: {
        en: 'Earthquake',
        fr: 'Tremblement de terre',
      },
    },
    description: {
      translation: {
        en: 'This is item 1 description',
        fr: 'This is item 1 description FR',
      },
    },
    orderRank: 4,
    status: 2,
    isOther: false,
    isDefault: false,
    subitems: [],
  },
];

export const mockOptionItem = (force?: Partial<IOptionItem>): IOptionItem => ({
  ...mockBaseData({ id: '1' }),
  name: {
    translation: {
      en: 'Flood',
      fr: 'Inundation',
    },
  },
  description: {
    translation: {
      en: 'This is item 1 description',
      fr: 'This is item 1 description FR',
    },
  },
  orderRank: 2,
  status: 1,
  isOther: true,
  isDefault: false,
  subitems: [mockOptionSubItem({ id: '7eb37c59-4947-4edf-8146-c2458bd2b6f6' }), mockOptionSubItem({ id: '2' })],
  ...force,
});

export const mockCombineOptionItem = (): IOptionItemCombined => ({
  entity: mockOptionItem(),
  metadata: null as never,
});

export const mockOptionItems = (): IOptionItem[] => [mockOptionItem()];

export const mockCombinedOptionItems = (): IOptionItemCombined[] => [mockCombineOptionItem()];

export const mockSubItem = (): IOptionSubItem => ({
  id: 'ID',
  tenantId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  created: '2021-08-12T19:58:28.654Z',
  timestamp: '2021-08-12T19:58:28.654Z',
  createdBy: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  lastUpdatedBy: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  lastAction: '',
  lastActionCorrelationId: '',
  name: {
    translation: {
      en: 'EN',
      fr: 'FR',
    },
  },
  orderRank: 1,
  status: Status.Active,
  description: {
    translation: {
      en: 'subItem description EN',
      fr: 'subItem description FR',
    },
  },
  isOther: false,
  isDefault: false,
});

// eslint-disable-next-line max-lines-per-function
export const mockRoles = (): IOptionItem[] => [
  {
    name: { translation: { en: 'Level  4', fr: 'Niveau 4' } },
    description: null,
    orderRank: 4,
    isOther: false,
    isDefault: false,
    subitems: [
      {
        name: { translation: { en: 'Operations Manager', fr: 'Gestionnaire des opérations' } },
        description: null,
        orderRank: 1,
        isOther: false,
        isDefault: false,
        id: 'a6ffce22-8396-43c9-bdc3-6532925af251',
        tenantId: 'c400f50d-7a56-4ef2-8e44-211bfa434724',
        created: '2021-04-13T14:31:39.1252272Z',
        timestamp: '0001-01-01T00:00:00',
        status: 1,
        createdBy: '00000000-0000-0000-0000-000000000000',
        lastUpdatedBy: null,
        lastAction: null,
        lastActionCorrelationId: '00000000-0000-0000-0000-000000000000',
      },
      {
        name: { translation: { en: 'Recovery Manager', fr: 'Gestionnaire, Rétablissement  ' } },
        description: null,
        orderRank: 2,
        isOther: false,
        isDefault: false,
        id: '1bdf0ed1-284d-47e3-9366-a515d6af910d',
        tenantId: 'c400f50d-7a56-4ef2-8e44-211bfa434724',
        created: '2021-04-13T14:31:39.1252804Z',
        timestamp: '0001-01-01T00:00:00',
        status: 1,
        createdBy: '00000000-0000-0000-0000-000000000000',
        lastUpdatedBy: null,
        lastAction: null,
        lastActionCorrelationId: '00000000-0000-0000-0000-000000000000',
      },
      {
        name: {
          translation: {
            en: 'Rapid Deployment Case Management Team Member',
            fr: 'Conseiller(ère) en gestion de cas – Équipe de déploiement rapide',
          },
        },
        description: null,
        orderRank: 3,
        isOther: false,
        isDefault: false,
        id: '85315955-e20e-40bd-a672-f60b2871a0ab',
        tenantId: 'c400f50d-7a56-4ef2-8e44-211bfa434724',
        created: '2021-04-13T14:31:39.1253016Z',
        timestamp: '0001-01-01T00:00:00',
        status: 1,
        createdBy: '00000000-0000-0000-0000-000000000000',
        lastUpdatedBy: null,
        lastAction: null,
        lastActionCorrelationId: '00000000-0000-0000-0000-000000000000',
      },
    ],
    id: '942da95a-9c84-ffe8-adf6-3dd8e7c263d1',
    tenantId: 'c400f50d-7a56-4ef2-8e44-211bfa434724',
    created: '2021-04-09T19:23:33.709Z',
    timestamp: '2021-10-19T18:44:52.0366271Z',
    status: 1,
    createdBy: '00000000-0000-0000-0000-000000000000',
    lastUpdatedBy: '113e1ddf-6709-41a1-a155-a3f12260eebc',
    lastAction: null,
    lastActionCorrelationId: '00000000-0000-0000-0000-000000000000',
  },
  {
    name: { translation: { en: 'Level 5', fr: 'Niveau 5' } },
    description: null,
    orderRank: 5,
    isOther: false,
    isDefault: false,
    subitems: [
      {
        name: { translation: { en: 'Systems Team Member', fr: "Membre de l'équipe Systèmes" } },
        description: null,
        orderRank: 1,
        isOther: false,
        isDefault: false,
        id: 'abafdc5b-09ea-42d2-9d96-2ecdb36a7e24',
        tenantId: 'c400f50d-7a56-4ef2-8e44-211bfa434724',
        created: '2021-04-12T14:35:04.0556885Z',
        timestamp: '0001-01-01T00:00:00',
        status: 1,
        createdBy: '00000000-0000-0000-0000-000000000000',
        lastUpdatedBy: null,
        lastAction: null,
        lastActionCorrelationId: '00000000-0000-0000-0000-000000000000',
      },
      {
        name: { translation: { en: 'Test edited', fr: 'Test' } },
        description: { translation: { en: 'Test', fr: 'Test' } },
        orderRank: 2,
        isOther: false,
        isDefault: false,
        id: 'b1a85314-d88b-496d-a8c6-ebe462244311',
        tenantId: 'c400f50d-7a56-4ef2-8e44-211bfa434724',
        created: '2021-04-12T14:35:04.0493245Z',
        timestamp: '2021-06-23T18:09:05.7724933Z',
        status: 2,
        createdBy: '00000000-0000-0000-0000-000000000000',
        lastUpdatedBy: '0d22f50a-e1ab-435d-a9f0-cfda502866f4',
        lastAction: null,
        lastActionCorrelationId: '00000000-0000-0000-0000-000000000000',
      },
    ],
    id: '7ca4d2ee-5a14-cb58-76f3-7be0cedb73e5',
    tenantId: 'c400f50d-7a56-4ef2-8e44-211bfa434724',
    created: '2021-04-09T19:23:33.709Z',
    timestamp: '2021-06-23T18:09:05.7725654Z',
    status: 1,
    createdBy: '00000000-0000-0000-0000-000000000000',
    lastUpdatedBy: '0d22f50a-e1ab-435d-a9f0-cfda502866f4',
    lastAction: null,
    lastActionCorrelationId: '00000000-0000-0000-0000-000000000000',
  },
  {
    name: { translation: { en: 'Level 6', fr: 'Niveau 6' } },
    description: null,
    orderRank: 6,
    isOther: false,
    isDefault: false,
    subitems: [
      {
        name: { translation: { en: 'System Admin', fr: 'Administrateur(-trice) de système' } },
        description: { translation: { en: 'sd', fr: 'sd' } },
        orderRank: 1,
        isOther: false,
        isDefault: false,
        id: 'c926c6c8-380d-4307-ab77-55c39899d108',
        tenantId: 'c400f50d-7a56-4ef2-8e44-211bfa434724',
        created: '2021-04-13T14:31:39.1256511Z',
        timestamp: '2021-05-25T15:59:38.9595322Z',
        status: 1,
        createdBy: '00000000-0000-0000-0000-000000000000',
        lastUpdatedBy: null,
        lastAction: null,
        lastActionCorrelationId: '00000000-0000-0000-0000-000000000000',
      },
      {
        name: { translation: { en: 'Add - New System Admin - edited', fr: 'Add - New System Admin - FR' } },
        description: {
          translation: { en: 'This is a new System Admin role for access level 6', fr: 'This is a new System Admin role for access level 6' },
        },
        orderRank: 2,
        isOther: false,
        isDefault: false,
        id: 'fbf863cf-a3f7-4dd1-8cd1-76212bd76493',
        tenantId: 'c400f50d-7a56-4ef2-8e44-211bfa434724',
        created: '2021-04-19T19:25:43.2437653Z',
        timestamp: '2021-05-25T15:58:42.9212737Z',
        status: 1,
        createdBy: '00000000-0000-0000-0000-000000000000',
        lastUpdatedBy: null,
        lastAction: null,
        lastActionCorrelationId: '00000000-0000-0000-0000-000000000000',
      },
    ],
    id: '58ff083e-b3d2-55af-705a-5db5619806c3',
    tenantId: 'c400f50d-7a56-4ef2-8e44-211bfa434724',
    created: '2021-04-09T19:23:33.709Z',
    timestamp: '2021-05-25T15:59:38.9595623Z',
    status: 1,
    createdBy: '00000000-0000-0000-0000-000000000000',
    lastUpdatedBy: null,
    lastAction: null,
    lastActionCorrelationId: '00000000-0000-0000-0000-000000000000',
  },
  {
    name: { translation: { en: 'Contributor 3', fr: 'Contributeur 3' } },
    description: null,
    orderRank: 9,
    isOther: false,
    isDefault: false,
    subitems: [
      {
        name: { translation: { en: 'Advisor', fr: 'Conseiller(-ère)' } },
        description: null,
        orderRank: 1,
        isOther: false,
        isDefault: false,
        id: 'aa262875-f242-450b-8c4b-c07acf88627a',
        tenantId: 'c400f50d-7a56-4ef2-8e44-211bfa434724',
        created: '2021-04-13T14:31:39.1257574Z',
        timestamp: '0001-01-01T00:00:00',
        status: 1,
        createdBy: '00000000-0000-0000-0000-000000000000',
        lastUpdatedBy: null,
        lastAction: null,
        lastActionCorrelationId: '00000000-0000-0000-0000-000000000000',
      },
    ],
    id: '29c1e33c-0443-2054-6330-e4aabb912f5a',
    tenantId: 'c400f50d-7a56-4ef2-8e44-211bfa434724',
    created: '2021-04-09T19:23:33.709Z',
    timestamp: '2021-04-13T17:26:53.3794423Z',
    status: 1,
    createdBy: '00000000-0000-0000-0000-000000000000',
    lastUpdatedBy: null,
    lastAction: null,
    lastActionCorrelationId: '00000000-0000-0000-0000-000000000000',
  },
];
