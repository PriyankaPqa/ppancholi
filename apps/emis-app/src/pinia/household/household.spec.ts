import { getBaseStoreComponents } from '@libs/stores-lib/base';
import { getExtensionComponents } from '@/pinia/household/household-extension';

import { defineStore, setActivePinia } from 'pinia';
import { createTestingPinia } from '@pinia/testing';
import { mockHouseholdsService } from '@libs/services-lib/households/entity';
import { IdParams, IHouseholdEntity, mockHouseholdEntity } from '@libs/entities-lib/household';
import { mockAddress } from '@libs/entities-lib/value-objects/address';

const entityService = mockHouseholdsService();
const baseComponents = getBaseStoreComponents<IHouseholdEntity, IdParams>(entityService);

const getPinia = () => {
  const pinia = createTestingPinia({
    stubActions: false,
  });
  setActivePinia(pinia);
  return pinia;
};

const useHouseholdTestStore = (opts = {}) => {
  const newBaseComponents = {
    ...baseComponents,
    ...opts,
  };

  const extensionComponents = getExtensionComponents(newBaseComponents, entityService);

  const useStore = defineStore('test-household', () => ({
    ...newBaseComponents,
    ...extensionComponents,
  }));
  return useStore();
};

const createTestStore = (bComponents = {}) => {
  getPinia();
  const store = useHouseholdTestStore(bComponents);
  return store;
};

describe('>>> Household Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateNoFixedHomeAddress', () => {
    it('should call updateNoFixedHomeAddress service and set the result in the store', async () => {
      const householdId = '1';
      const observation = 'observation';
      const bComponents = {
        ...baseComponents,
        set: jest.fn(),
      };
      const store = createTestStore(bComponents);

      await store.updateNoFixedHomeAddress({
        householdId,
        observation,
      });

      expect(entityService.updateNoFixedHomeAddress).toBeCalledWith(householdId, false, observation);
      expect(bComponents.set).toBeCalledWith(mockHouseholdEntity());
    });
  });

  describe('updateHomeAddress', () => {
    it('should call updateHomeAddress service and set the result in the store', async () => {
      const householdId = '1';
      const address = mockAddress();
      const bComponents = {
        ...baseComponents,
        set: jest.fn(),
      };
      const store = createTestStore(bComponents);
      await store.updateHomeAddress({ householdId, address });

      expect(entityService.updateHomeAddress).toBeCalledWith(householdId, false, address);
      expect(bComponents.set).toBeCalledWith(mockHouseholdEntity());
    });
  });

  describe('flagNewDuplicate', () => {
    it('should call flagNewDuplicate service and set the result in the store', async () => {
      const id = '0';
      const duplicateHouseholdId = '1';
      const duplicateReasons = [1];
      const memberFirstName = 'John';
      const memberLastName = 'Smith';
      const rationale = 'rationale';
      const bComponents = {
        ...baseComponents,
        set: jest.fn(),
      };

      const payload = { duplicateHouseholdId, duplicateReasons, memberFirstName, memberLastName, rationale };
      const store = createTestStore(bComponents);
      await store.flagNewDuplicate(id, payload);

      expect(entityService.flagNewDuplicate).toBeCalledWith(id, payload);
      expect(bComponents.set).toBeCalledWith(mockHouseholdEntity());
    });
  });

  describe('flagDuplicate', () => {
    it('should call flagDuplicate service and set the result in the store', async () => {
      const id = '0';
      const duplicateHouseholdId = '1';
      const potentialDuplicateId = '123';
      const rationale = 'rationale';
      const bComponents = {
        ...baseComponents,
        set: jest.fn(),
      };

      const payload = { duplicateHouseholdId, rationale, potentialDuplicateId };
      const store = createTestStore(bComponents);
      await store.flagDuplicate(id, payload);

      expect(entityService.flagDuplicate).toBeCalledWith(id, payload);
      expect(bComponents.set).toBeCalledWith(mockHouseholdEntity());
    });
  });

  describe('resolveDuplicate', () => {
    it('should call resolveDuplicate service and set the result in the store', async () => {
      const id = '0';
      const duplicateHouseholdId = '1';
      const potentialDuplicateId = '123';
      const rationale = 'rationale';
      const bComponents = {
        ...baseComponents,
        set: jest.fn(),
      };

      const payload = { duplicateHouseholdId, rationale, potentialDuplicateId };
      const store = createTestStore(bComponents);
      await store.resolveDuplicate(id, payload);

      expect(entityService.resolveDuplicate).toBeCalledWith(id, payload);
      expect(bComponents.set).toBeCalledWith(mockHouseholdEntity());
    });
  });
});
