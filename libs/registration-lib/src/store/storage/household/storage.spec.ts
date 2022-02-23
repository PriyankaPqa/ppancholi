import { mockStore } from '@/store';
import { mockAddress } from '@/entities/value-objects/address';
import { mockHouseholdEntity } from '@/entities/household';
import { HouseholdStorage } from './storage';

const store = mockStore({}, { commit: true, dispatch: true });
const storage = new HouseholdStorage(store, 'household', 'householdMetadata').make();

describe('>>> Household Storage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('>> Actions', () => {
    it('should proxy updateNoFixedHomeAddress', () => {
      const householdId = '1';
      const observation = 'observation';
      storage.actions.updateNoFixedHomeAddress(householdId, observation);
      expect(store.dispatch).toBeCalledWith('household/updateNoFixedHomeAddress', { householdId, observation });
    });

    it('should proxy updateHomeAddress', () => {
      const householdId = '1';
      const address = mockAddress();
      storage.actions.updateHomeAddress(householdId, address);
      expect(store.dispatch).toBeCalledWith('household/updateHomeAddress', { householdId, address });
    });

    it('should proxy fetchHouseholdHistory', () => {
      const household = mockHouseholdEntity();
      storage.actions.fetchHouseholdHistory(household);
      expect(store.dispatch).toBeCalledWith('household/fetchHouseholdHistory', household);
    });
  });
});
