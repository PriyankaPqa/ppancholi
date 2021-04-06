import { IOptionItemData } from '@/types';
import { ContactInformation } from './contactInformation';
import { IContactInformationData, IContactInformation } from './contactInformation.types';

export const mockContactInformationData = (): IContactInformationData => ({
  preferredLanguage: {
    name: {
      translation: {
        en: 'French',
        fr: 'Français',
      },
    },
    orderRank: 0,
    isOther: false,
    isDefault: false,
    id: '3dd21738-e599-443a-aae1-496d7decc458',
    status: 1,
  },
  preferredLanguageOther: '',
  homePhone: {
    number: '(514) 545-4548',
    countryISO2: 'CA',
    e164Number: '15145454548',
  },
  primarySpokenLanguage: {
    name: {
      translation: {
        en: 'English',
        fr: 'Anglais',
      },
    },
    orderRank: 0,
    isOther: false,
    isDefault: true,
    id: '5d0c1c8d-c3cd-4818-a670-c92b3cb84081',
    status: 1,
  },
  primarySpokenLanguageOther: '',
  email: 'rok@sdf.ca',
});

export const mockContactInformation = (): IContactInformation => new ContactInformation(mockContactInformationData());

export const mockPreferredLanguages = (): IOptionItemData[] => [
  {
    name: { translation: { en: 'French', fr: 'Français' } },
    orderRank: 0,
    isOther: false,
    isDefault: false,
    status: 1,
    id: '3dd21738-e599-443a-aae1-496d7decc458',
  },
  {
    name: { translation: { en: 'English', fr: 'Anglais' } },
    orderRank: 1,
    isOther: false,
    isDefault: true,
    status: 1,
    id: '2a2d68bb-281b-4408-b62b-170df9728f69',
  },
  {
    name: { translation: { en: 'Please specify', fr: 'Autre: spécifier' } },
    orderRank: 2,
    isOther: true,
    isDefault: false,
    id: '04718e75-2ae0-4a2a-8647-326edee4bb32',
    status: 1,
  },
];

export const mockPrimarySpokenLanguages = (): IOptionItemData[] => [
  {
    name: { translation: { en: 'English', fr: 'Anglais' } },
    orderRank: 0,
    isOther: false,
    isDefault: true,
    id: '5d0c1c8d-c3cd-4818-a670-c92b3cb84081',
    status: 1,
  },
  {
    name: { translation: { en: 'French', fr: 'Français' } },
    orderRank: 1,
    isOther: false,
    isDefault: false,
    id: '10bb1498-cdf9-458a-acc9-b3a2b02ba1f9',
    status: 1,
  },
  {
    name: { translation: { en: 'Please specify', fr: 'Autre: spécifier' } },
    orderRank: 1,
    isOther: true,
    isDefault: false,
    id: '04718e75-2ae0-4a2a-8647-326edee4bb32',
    status: 1,
  },
];
