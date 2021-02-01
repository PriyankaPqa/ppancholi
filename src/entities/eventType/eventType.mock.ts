import { IEventTypeData } from './eventType.types';

export const mockEventTypeData = (): IEventTypeData[] => [{
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
}];
