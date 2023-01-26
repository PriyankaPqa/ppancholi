import { defineStore } from 'pinia';

import { OptionItemsService } from '@libs/services-lib/optionItems';
import { httpClient } from '@/services/httpClient';
import { getExtensionComponents } from '@/pinia/option-list/optionListExtension';

const storeId = 'option-list';
const optionsService = new OptionItemsService(httpClient);

const extensionComponents = getExtensionComponents(optionsService);

export const useOptionListStore = defineStore(`${storeId}`, () => ({
  ...extensionComponents,
}));
