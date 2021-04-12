import { EOptionListItemStatus, IOptionItemData, IOptionSubItem } from './optionItem.types';

export const mockOptionItemData = (): IOptionItemData[] => [{
  id: '1',
  created: new Date('2021-01-14T00:00:00.000Z'),
  timestamp: new Date('2021-01-14T00:00:00.000Z'),
  eTag: '',
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
  subitems: [{
    name: {
      translation: {
        en: 'Sub-item 1',
        fr: 'Sub-item 1',
      },
    },
    description: {
      translation: {
        en: 'This is sub-item 1 description',
        fr: 'This is sub-item 1 description FR',
      },
    },
    orderRank: 1,
    status: EOptionListItemStatus.Active,
    isDefault: false,
    isOther: false,
  }],
}, {
  id: '2',
  created: new Date('2021-01-14T00:00:00.000Z'),
  timestamp: new Date('2021-01-14T00:00:00.000Z'),
  eTag: '',
  name: {
    translation: {
      en: 'Wildfire',
      fr: 'Incendies',
    },
  },
  orderRank: 3,
  status: 1,
  isOther: false,
  isDefault: true,
  subitems: [],
}, {
  id: '3',
  created: new Date('2021-01-14T00:00:00.000Z'),
  timestamp: new Date('2021-01-14T00:00:00.000Z'),
  eTag: '',
  name: {
    translation: {
      en: 'Earthquake',
      fr: 'Tremblement de terre',
    },
  },
  orderRank: 4,
  status: 2,
  isOther: false,
  isDefault: false,
  subitems: [],
}];

export const mockSubItem = (): IOptionSubItem => ({
  id: 'ID',
  name: {
    translation: {
      en: 'EN',
      fr: 'FR',
    },
  },
  orderRank: 1,
  status: EOptionListItemStatus.Active,
  description: {
    translation: {
      en: 'description EN',
      fr: 'description FR',
    },
  },
  isOther: false,
  isDefault: false,
});
