import { ECanadaProvinces, IAzureSearchResult } from '@/types';
import { TranslateResult } from 'vue-i18n';
import { IPersonalInformation, IOptionItemData, IIndigenousIdentityData } from './personalInformation.types';

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
    id: '5d0c1c8d-c3cd-4818-a670-c92b3cb84081',
    status: 1,
  },
  primarySpokenLanguageOther: '',
  email: 'rok@sdf.ca',
  indigenousProvince: ECanadaProvinces.NL,
  indigenousType: null,
  indigenousCommunityId: null,
  indigenousCommunityOther: '',

  validate: null,
});

export const mockGenders = (): IOptionItemData[] => [
  {
    name: { translation: { en: 'Female', fr: 'Femme' } },
    orderRank: 0,
    isOther: false,
    isDefault: false,
    status: 1,
    id: '676eb98b-d432-4924-90ee-2489e3acdc26',
  },
  {
    name: { translation: { en: 'Please specify', fr: 'Autre: spécifier' } },
    orderRank: 1,
    isOther: true,
    isDefault: false,
    status: 1,
    id: '04718e75-2ae0-4a2a-8647-326edee4bb32',
  },
  {
    name: { translation: { en: 'Male', fr: 'Homme' } },
    orderRank: 2,
    isOther: false,
    isDefault: true,
    status: 1,
    id: '0db033fc-a52d-470e-9126-3e21c77d9a24',
  },
];

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

export const mockIndigenousIdentities = (): IAzureSearchResult<IIndigenousIdentityData> => ({
  odataContext: 'test',
  odataCount: 4,
  value: [
    {
      province: 4,
      communityType: 1,
      communityName: 'Eel River Bar First Nations',
      id: '434be79f-6713-0847-a0d9-c6bd7f9f12f5',
      status: 1,
    },
    {
      province: 4,
      communityType: 1,
      communityName: "Metepenagiag Mi'kmaq Nation",
      id: 'c68b30e0-e348-544d-ba7e-7e8486972774',
      status: 1,
    },
    {
      province: 4,
      communityType: 2,
      communityName: 'Oromocto First Nations',
      id: '11478c60-8e55-3a4a-9143-bf0719c86d8e',
      status: 1,
    },
    {
      province: 4,
      communityType: 2,
      communityName: 'Madawaska Maliseet First Nation',
      id: '1fa967d0-6d92-5f47-bd1a-ba7c2b05e76a',
      status: 1,
    },
  ],
});

export const mockIndigenousTypesItems = (): Record<string, TranslateResult>[] => [
  {
    value: 'FirstNations',
    text: 'First nations',
  },
  {
    value: 'InuitCommunity',
    text: 'Inuit Community',
  },
  {
    value: 'Other',
    text: 'Other',
  },
];

export const mockIndigenousCommunitiesItems = (): Record<string, string>[] => [
  {
    value: '434be79f-6713-0847-a0d9-c6bd7f9f12f5',
    text: 'Eel River Bar First Nations',
  },
  {
    value: 'c68b30e0-e348-544d-ba7e-7e8486972774',
    text: "Metepenagiag Mi'kmaq Nation",
  },
];
