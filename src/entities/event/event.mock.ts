import { IEventData } from './event.types';

export const mockEventsData = (): IEventData[] => ([{
  id: '7c076603-580a-4400-bef2-5ddececb0931',
  responseDetails: {
    assistanceNumber: '+15144544545',
  },
  name: {
    translation: {
      en: 'Gatineau Floods 2021',
      fr: 'Inondations Gatineau 2021',
    },
  },
  registrationLink: {
    translation: {
      en: 'https://www.redcross.ca/gatineau-floods-2021',
      fr: 'https://www.redcross.ca/inondations-gatineau-2021',
    },
  },
}]);
