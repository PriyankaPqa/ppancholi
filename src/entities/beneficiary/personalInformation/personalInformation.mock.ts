import { ECanadaProvinces } from '@/types';
import {
  IPersonalInformation,
  IOptionItemData,
  IIndigenousCommunityData,
} from './personalInformation.types';

export const mockPersonalInformation = (): IPersonalInformation => ({
  birthDate: {
    year: 1999,
    month: 2,
    day: 12,
  },
  firstName: 'Bob',
  middleName: 'middle',
  lastName: 'Smith',
  gender: {
    name: {
      translation: {
        en: 'Female',
        fr: 'Femme',
      },
    },
    orderRank: 0,
    isOther: false,
    isDefault: false,
    itemStatus: 0,
    id: '676eb98b-d432-4924-90ee-2489e3acdc26',
    status: 1,
  },
  genderOther: '',
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
    itemStatus: 0,
    id: '3dd21738-e599-443a-aae1-496d7decc458',
    status: 1,
  },
  preferredLanguageOther: '',
  homePhone: {
    number: '(514) 545-4548',
    countryISO2: 'CA',
    e164Number: '15145454548',
  },
  preferredName: 'preferredName',
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
    itemStatus: 1,
    id: '5d0c1c8d-c3cd-4818-a670-c92b3cb84081',
    status: 1,
  },
  primarySpokenLanguageOther: '',
  email: 'rok@sdf.ca',
  indigenousProvince: ECanadaProvinces.NL,
  indigenousType: null,
  indigenousCommunity: null,
  indigenousCommunityOther: '',

  validate: null,
});

export const mockGenders = (): IOptionItemData[] => [
  {
    name: { translation: { en: 'Female', fr: 'Femme' } },
    orderRank: 0,
    isOther: false,
    isDefault: false,
    itemStatus: 1,
    id: '676eb98b-d432-4924-90ee-2489e3acdc26',
    status: 1,
  },
  {
    name: { translation: { en: 'Please specify', fr: 'Autre: spécifier' } },
    orderRank: 1,
    isOther: true,
    isDefault: false,
    itemStatus: 1,
    id: '04718e75-2ae0-4a2a-8647-326edee4bb32',
    status: 1,
  },
  {
    name: { translation: { en: 'Male', fr: 'Homme' } },
    orderRank: 2,
    isOther: false,
    isDefault: true,
    itemStatus: 1,
    id: '0db033fc-a52d-470e-9126-3e21c77d9a24',
    status: 1,
  },
];

export const mockPreferredLanguages = (): IOptionItemData[] => [
  {
    name: { translation: { en: 'French', fr: 'Français' } },
    orderRank: 0,
    isOther: false,
    isDefault: false,
    itemStatus: 1,
    id: '3dd21738-e599-443a-aae1-496d7decc458',
    status: 1,
  },
  {
    name: { translation: { en: 'English', fr: 'Anglais' } },
    orderRank: 1,
    isOther: false,
    isDefault: true,
    itemStatus: 1,
    id: '2a2d68bb-281b-4408-b62b-170df9728f69',
    status: 1,
  },
  {
    name: { translation: { en: 'Please specify', fr: 'Autre: spécifier' } },
    orderRank: 2,
    isOther: true,
    isDefault: false,
    itemStatus: 1,
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
    itemStatus: 1,
    id: '5d0c1c8d-c3cd-4818-a670-c92b3cb84081',
    status: 1,
  },
  {
    name: { translation: { en: 'French', fr: 'Français' } },
    orderRank: 1,
    isOther: false,
    isDefault: false,
    itemStatus: 1,
    id: '10bb1498-cdf9-458a-acc9-b3a2b02ba1f9',
    status: 1,
  },
  {
    name: { translation: { en: 'Please specify', fr: 'Autre: spécifier' } },
    orderRank: 1,
    isOther: true,
    isDefault: false,
    itemStatus: 1,
    id: '04718e75-2ae0-4a2a-8647-326edee4bb32',
    status: 1,
  },
];

export const mockIndigenousTypes = (): IOptionItemData[] => [];

export const mockIndigenousCommunities = (): IIndigenousCommunityData[] => [];
