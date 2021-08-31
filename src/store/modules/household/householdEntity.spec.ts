import { ActionContext } from 'vuex';

import { httpClient } from '@/services/httpClient';

import { HouseholdEntityModule } from '@/store/modules/household/householdEntity';
import { HouseholdsService } from '@/services/households/entity';
import { IHouseholdEntity, mockHouseholdEntity } from '@/entities/household';
import { IState } from '@/store/modules/base';
import { mockAddress } from '@/entities/value-objects/address';

const module = new HouseholdEntityModule(new HouseholdsService(httpClient));

const actionContext = {
  commit: jest.fn(),
  dispatch: jest.fn(),
  state: null,
  getters: {
    tagsOptions: jest.fn(), inactiveReasons: jest.fn(), closeReasons: jest.fn(), screeningIds: jest.fn(),
  },
  rootState: null,
  rootGetters: {},
} as ActionContext<IState<IHouseholdEntity>, IState<IHouseholdEntity>>;

describe('Household entity module', () => {
  describe('actions', () => {
    describe('updateNoFixedHomeAddress', () => {
      it('should call updateNoFixedHomeAddress service and set the result in the store', async () => {
        const householdId = '1';
        const observation = 'observation';
        module.service.updateNoFixedHomeAddress = jest.fn(() => Promise.resolve(mockHouseholdEntity()));

        await module.actions.updateNoFixedHomeAddress(actionContext, { householdId, observation });

        expect(module.service.updateNoFixedHomeAddress).toBeCalledWith(householdId, observation);
        expect(actionContext.commit).toBeCalledWith('set', mockHouseholdEntity());
      });
    });

    describe('updateHomeAddress', () => {
      it('should call updateHomeAddress service and set the result in the store', async () => {
        const householdId = '1';
        const address = mockAddress();
        module.service.updateHomeAddress = jest.fn(() => Promise.resolve(mockHouseholdEntity()));

        await module.actions.updateHomeAddress(actionContext, { householdId, address });

        expect(module.service.updateHomeAddress).toBeCalledWith(householdId, address);
        expect(actionContext.commit).toBeCalledWith('set', mockHouseholdEntity());
      });
    });
  });
});
