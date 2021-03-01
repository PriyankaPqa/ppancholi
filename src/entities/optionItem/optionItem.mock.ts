import { IOptionItemData } from './optionItem.types';

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
  orderRank: 1,
  status: 1,
  itemStatus: 1,
  isOther: true,
  isDefault: false,
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
  orderRank: 2,
  status: 1,
  itemStatus: 1,
  isOther: false,
  isDefault: true,
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
  orderRank: 3,
  status: 2,
  itemStatus: 2,
  isOther: false,
  isDefault: false,
}];
