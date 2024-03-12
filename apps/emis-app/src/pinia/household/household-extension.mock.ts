import { ref } from 'vue';
import { IHouseholdEntity } from '@libs/entities-lib/household';

export function getMockExtensionComponents(entity: IHouseholdEntity) {
  return {
    searchResultsShown: ref(false),
    updateNoFixedHomeAddress: jest.fn(() => entity),
    updateHomeAddress: jest.fn(() => entity),
    flagNewDuplicate: jest.fn(() => [entity]),
    flagDuplicate: jest.fn(() => [entity]),
    resolveDuplicate: jest.fn(() => [entity]),
  };
}
