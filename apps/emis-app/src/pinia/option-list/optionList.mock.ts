import { createTestingPinia, TestingPinia } from '@pinia/testing';
import {
 ICreateOptionItemRequest,
} from '@libs/entities-lib/optionItem';
import { Status } from '@libs/entities-lib/base';

import { defineStore } from 'pinia';
import { getMockOptionListExtensionComponents } from '@/pinia/option-list/optionListExtension.mock';

const storeId = 'option-list';

export const useMockOptionListStore = (pinia?: TestingPinia) => {
  const p = pinia || createTestingPinia(
    {
      stubActions: false,
},
);

  const useOptionListStore = defineStore(`${storeId}`, () => ({
      ...getMockOptionListExtensionComponents(),
  }));

  return {
    pinia: p,
    optionListStore: useOptionListStore(),
  };
};

export const mockCreateOptionPayload: ICreateOptionItemRequest = {
  name: { translation: { en: 'English Test', fr: 'French Test' } },
  status: Status.Active,
  orderRank: 1,
};
