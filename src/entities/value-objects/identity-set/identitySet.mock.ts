import deepmerge from 'deepmerge';
import {
  ECanadaProvinces, IAzureSearchResult, IOptionItemData,
} from '../../../types';
import {
  EIndigenousTypes, IIndigenousIdentityData, IIdentitySetData, IIdentitySet, IIdentitySetCreateRequest,
} from './identitySet.types';
import { IdentitySet } from './identitySet';

export const mockGenderFemale = (): IOptionItemData => ({
  name: { translation: { en: 'Female', fr: 'Femme' } },
  orderRank: 0,
  isOther: false,
  isDefault: false,
  status: 1,
  id: '676eb98b-d432-4924-90ee-2489e3acdc26',
});

export const mockGenderMale = (): IOptionItemData => ({
  name: { translation: { en: 'Male', fr: 'Homme' } },
  orderRank: 2,
  isOther: false,
  isDefault: true,
  status: 1,
  id: '0db033fc-a52d-470e-9126-3e21c77d9a24',
});

export const mockGenderOther = (): IOptionItemData => ({
  name: { translation: { en: 'Please specify', fr: 'Autre: spécifier' } },
  orderRank: 1,
  isOther: true,
  isDefault: false,
  status: 1,
  id: '04718e75-2ae0-4a2a-8647-326edee4bb32',
});

export const mockGenders = (): IOptionItemData[] => [
  mockGenderFemale(),
  mockGenderOther(),
  mockGenderMale(),
];

export const mockIndigenousIdentitiesSearchData = (): IAzureSearchResult<IIndigenousIdentityData> => ({
  odataContext: 'test',
  odataCount: 1,
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

export const mockIndigenousTypesItems = (): Record<string, unknown>[] => [
  {
    value: EIndigenousTypes.FirstNations,
    text: 'common.indigenous.types.FirstNations',
  },
  {
    value: EIndigenousTypes.InuitCommunity,
    text: 'common.indigenous.types.InuitCommunity',
  },
  {
    value: EIndigenousTypes.Other,
    text: 'common.indigenous.types.Other',
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

export const mockIdentitySetData = (): IIdentitySetData => ({
  birthDate: {
    year: 1999,
    month: 2,
    day: 12,
  },
  dateOfBirth: '',
  firstName: 'Bob',
  middleName: 'middle',
  lastName: 'Smith',
  gender: mockGenders()[0],
  genderOther: null,
  preferredName: 'preferredName',
  indigenousProvince: ECanadaProvinces.AB,
  indigenousType: EIndigenousTypes.FirstNations,
  indigenousCommunityId: 'guid-community',
  indigenousCommunityOther: '',
});

export const mockIdentitySet = (force?: Partial<IIdentitySetData>): IIdentitySet => new IdentitySet(deepmerge(mockIdentitySetData(), force || {}));

export const mockIdentitySetCreateRequest = (): IIdentitySetCreateRequest => ({
  dateOfBirth: '1999-02-2',
  firstName: 'Bob',
  middleName: 'middle',
  lastName: 'Smith',
  gender: { optionItemId: 'f0741697-e8aa-4e0b-8e45-5528be33d915', specifiedOther: 'ddddddddddddd' },
  preferredName: 'preferredName',
  indigenousIdentity: {
    indigenousCommunityId: 'guid-community',
    specifiedOther: '',
  },
});
