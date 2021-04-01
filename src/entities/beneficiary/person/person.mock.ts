import { ECanadaProvinces, IAzureSearchResult, IOptionItemData } from '@/types';
import { TranslateResult } from 'vue-i18n';
import { IPerson, IIndigenousIdentityData, IPersonData } from './person.types';
import { Person } from './person';

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

export const mockPersonData = (): IPersonData => ({
  birthDate: {
    year: 1999,
    month: 2,
    day: 12,
  },
  firstName: 'Bob',
  middleName: 'middle',
  lastName: 'Smith',
  gender: mockGenders()[0],
  genderOther: '',
  preferredName: 'preferredName',
  indigenousProvince: ECanadaProvinces.NL,
  indigenousType: null,
  indigenousCommunityId: null,
  indigenousCommunityOther: '',
});

export const mockPerson = (): IPerson => new Person(mockPersonData());

export const mockIndigenousIdentitiesSearchData = (): IAzureSearchResult<IIndigenousIdentityData> => ({
  odataContext: 'test',
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
