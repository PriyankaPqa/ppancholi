import {
  IOptionItem, IOptionItemCombined, IOptionItemData, IOptionSubItem,
} from './optionItem.types';
import { mockBaseData, Status } from '@/entities/base';

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
  eTag: '',
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
