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
  subitems: [
    {
      name: {
        translation: {
          en: 'case worker 2',
          fr: 'case worker 2 fr',
        },
      },
      description: {
        translation: {
          en: 'case worker 2 description',
          fr: 'case worker 2 description fr',
        },
      },
      orderRank: 1,
      isOther: false,
      isDefault: false,
      id: '66e2fd56-3e16-4158-a1f3-922126ef8a96',
      status: 2,
      eTag: '*',
    },
    {
      name: {
        translation: {
          en: 'Case Worker',
          fr: 'Analyse de dossiers',
        },
      },
      description: null,
      orderRank: 2,
      isOther: false,
      isDefault: false,
      id: 'c4ca956f-162c-49b6-b371-69ef38eab4aa',
      status: 1,
      eTag: '*',
    },
  ],
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
      en: 'subItem description EN',
      fr: 'subItem description FR',
    },
  },
  isOther: false,
  isDefault: false,
});
