import { getBaseStoreComponents } from '@libs/stores-lib/base';
import { createTestingPinia } from '@pinia/testing';
import { defineStore, setActivePinia } from 'pinia';
import { mockPotentialDuplicatesService } from '@libs/services-lib/potential-duplicates/entity';
import { IPotentialDuplicateEntity, IdParams, mockPotentialDuplicateEntity } from '@libs/entities-lib/potential-duplicate';
import { getExtensionComponents } from './potential-duplicate-extension';

const entityService = mockPotentialDuplicatesService();
const baseComponents = getBaseStoreComponents<IPotentialDuplicateEntity, IdParams>(entityService);

const getPinia = () => {
  const pinia = createTestingPinia({
    initialState: {
      'test-potential-duplicate': {
      },
    },
    stubActions: false,
  });
  setActivePinia(pinia);
  return pinia;
};

const usePotentialDuplicateTestStore = (opts = {}) => {
  const newBaseComponents = {
    ...baseComponents,
    ...opts,
  };

  const extensionComponents = getExtensionComponents(newBaseComponents, entityService);

  const usePotentialDuplicateStore = defineStore('test-potential-duplicate', () => ({
    ...newBaseComponents,
    ...extensionComponents,
  }));
  return usePotentialDuplicateStore();
};

const createTestStore = (bComponents = {}) => {
  getPinia();
  return usePotentialDuplicateTestStore(bComponents);
};

describe('>>> Potential Duplicate Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('flagNewDuplicate', () => {
    it('should call flagNewDuplicate service and set the result in the store', async () => {
      const householdIds = ['1', '2'];
      const duplicateReasons = [1];
      const memberFirstName = 'John';
      const memberLastName = 'Smith';
      const rationale = 'rationale';
      const bComponents = {
        ...baseComponents,
        set: jest.fn(),
      };

      const payload = { householdIds, duplicateReasons, memberFirstName, memberLastName, rationale };
      const store = createTestStore(bComponents);
      await store.flagNewDuplicate(payload);

      expect(entityService.flagNewDuplicate).toBeCalledWith(payload);
      expect(bComponents.set).toBeCalledWith(mockPotentialDuplicateEntity());
    });
  });

  describe('flagDuplicate', () => {
    it('should call flagDuplicate service and set the result in the store', async () => {
      const id = '0';
      const rationale = 'rationale';
      const bComponents = {
        ...baseComponents,
        set: jest.fn(),
      };

      const store = createTestStore(bComponents);
      await store.flagDuplicate(id, rationale);

      expect(entityService.flagDuplicate).toBeCalledWith(id, rationale);
      expect(bComponents.set).toBeCalledWith(mockPotentialDuplicateEntity());
    });
  });

  describe('resolveDuplicate', () => {
    it('should call resolveDuplicate service and set the result in the store', async () => {
      const id = '0';
      const rationale = 'rationale';
      const bComponents = {
        ...baseComponents,
        set: jest.fn(),
      };

      const store = createTestStore(bComponents);
      await store.resolveDuplicate(id, rationale);

      expect(entityService.resolveDuplicate).toBeCalledWith(id, rationale);
      expect(bComponents.set).toBeCalledWith(mockPotentialDuplicateEntity());
    });
  });
});
