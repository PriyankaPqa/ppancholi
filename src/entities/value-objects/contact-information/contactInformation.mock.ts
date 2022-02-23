import deepmerge from 'deepmerge';
import { IOptionItemData } from '../../../types';
import { ContactInformation } from './contactInformation';
import {
  IContactInformationData, IContactInformation, IContactInformationCreateRequest, IValidateEmailResponse,
} from './contactInformation.types';

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

export const mockPrimarySpokenLanguage = (force?: Partial<IOptionItemData>): IOptionItemData => ({
  name: { translation: { en: 'English', fr: 'Anglais' } },
  orderRank: 0,
  isOther: false,
  isDefault: true,
  id: '5d0c1c8d-c3cd-4818-a670-c92b3cb84081',
  status: 1,
  ...force,
});

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

export const mockContactInformationData = (): IContactInformationData => ({
  preferredLanguage: mockPreferredLanguages()[0],
  preferredLanguageOther: '',
  homePhoneNumber: {
    number: '(514) 545-4548',
    countryCode: 'CA',
    e164Number: '15145454548',
  },
  alternatePhoneNumber: {
    number: '(438) 888-8888',
    countryCode: 'CA',
    e164Number: '15145454548',
    extension: '1234',
  },
  mobilePhoneNumber: {
    number: '(866) 866-6666',
    countryCode: 'CA',
    e164Number: '15145454548',
  },
  primarySpokenLanguage: mockPrimarySpokenLanguage(),
  primarySpokenLanguageOther: '',
  email: 'test@test.ca',
  emailValidatedByBackend: true,
});

export const mockPrimarySpokenLanguageOther = (): IContactInformation => new ContactInformation(
  {
    ...mockContactInformationData(),
    primarySpokenLanguageOther: 'Japanese',
    primarySpokenLanguage: mockPrimarySpokenLanguage({ isOther: true }),
  },
);

export const mockPreferredLanguageOther = (): IContactInformation => new ContactInformation(
  { ...mockContactInformationData(), preferredLanguageOther: 'Italian', preferredLanguage: mockPreferredLanguages()[2] },
);

export const mockContactInformation = (force?: Partial<IContactInformation>): IContactInformation => new ContactInformation(
  deepmerge(mockContactInformationData(), force || {}),
);

export const mockContactInformationCreateRequest = (): IContactInformationCreateRequest => ({
  ...mockContactInformationData(),
  preferredLanguage: { optionItemId: 'bd84e12c-b20b-4415-b3b6-c3f205b195ab', specifiedOther: null },
  primarySpokenLanguage: { optionItemId: '0a5956c2-16f0-4a79-acc4-4e36afcf3c3f', specifiedOther: null },
});

export const mockValidateEmailResponse = (): IValidateEmailResponse => ({
  errors: [],
  emailIsValid: true,
});
