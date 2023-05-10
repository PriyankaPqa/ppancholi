import { ref } from 'vue';
import { IHouseholdEntity } from '@libs/entities-lib/household';

export function getMockExtensionComponents(entity: IHouseholdEntity) {
  return {
    searchResultsShown: ref(false),
    updateNoFixedHomeAddress: jest.fn(() => entity),
    updateHomeAddress: jest.fn(() => entity),
    fetchHouseholdHistory: jest.fn(),
    flagNewDuplicate: jest.fn(() => entity),
  };
}
