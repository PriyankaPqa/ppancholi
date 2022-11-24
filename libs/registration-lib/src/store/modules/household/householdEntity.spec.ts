import { ActionContext } from 'vuex';

import { HouseholdsService } from '@libs/services-lib/households/entity';
import { mockStore } from '@/store';
import { HouseholdEntityModule } from '@/store/modules/household/householdEntity';
import { mockVersionedEntityCombined, mockVersionedEntity } from '@libs/entities-lib/value-objects/versioned-entity/versionedEntity.mock';
import utils from '@libs/entities-lib/value-objects/versioned-entity/versionedEntityUtils';
import { mockAddress } from '@libs/entities-lib/value-objects/address';
import { IHouseholdEntity, mockHouseholdEntity } from '@libs/entities-lib/household';
import { mockHttp } from '@libs/services-lib/http-client';
import { IHouseholdEntityState } from './householdEntity.types';

const myModule = new HouseholdEntityModule(new HouseholdsService(mockHttp()));
let store = mockStore();

const actionContext = {
  commit: jest.fn(),
  dispatch: jest.fn(),
  state: null,
  getters: {
    tagsOptions: jest.fn(), inactiveReasons: jest.fn(), closeReasons: jest.fn(), screeningIds: jest.fn(),
  },
  rootState: null,
  rootGetters: {},
} as ActionContext<IHouseholdEntityState, IHouseholdEntityState>;

describe('Household entity module', () => {
  describe('actions', () => {
    describe('updateNoFixedHomeAddress', () => {
      it('should call updateNoFixedHomeAddress service and set the result in the store', async () => {
        const householdId = '1';
        const observation = 'observation';
        myModule.service.updateNoFixedHomeAddress = jest.fn(() => Promise.resolve(mockHouseholdEntity()));

        await myModule.actions.updateNoFixedHomeAddress(actionContext, { householdId, observation });

        expect(myModule.service.updateNoFixedHomeAddress).toBeCalledWith(householdId, observation);
        expect(actionContext.commit).toBeCalledWith('set', mockHouseholdEntity());
      });
    });

    describe('updateHomeAddress', () => {
      it('should call updateHomeAddress service and set the result in the store', async () => {
        const householdId = '1';
        const address = mockAddress();
        myModule.service.updateHomeAddress = jest.fn(() => Promise.resolve(mockHouseholdEntity()));

        await myModule.actions.updateHomeAddress(actionContext, { householdId, address });

        expect(myModule.service.updateHomeAddress).toBeCalledWith(householdId, address);
        expect(actionContext.commit).toBeCalledWith('set', mockHouseholdEntity());
      });
    });

    describe('fetchHouseholdHistory', () => {
      it('calls the fetchHistory service for the household and the members and calls mapResponses and combineEntities with the results', async () => {
        const household = mockHouseholdEntity();
        myModule.service.getHouseholdHistory = jest.fn(() => Promise.resolve([
          mockVersionedEntity('household', { entity: { members: ['id-1'] } as IHouseholdEntity }),
          mockVersionedEntity('household', { entity: { members: ['id-1', 'id-2'] } as IHouseholdEntity }),
        ]));

        myModule.service.getHouseholdMetadataHistory = jest.fn(() => Promise.resolve([mockVersionedEntity()]));
        myModule.service.getMemberHistory = jest.fn(() => Promise.resolve([mockVersionedEntity()]));
        myModule.service.getMemberMetadataHistory = jest.fn(() => Promise.resolve([mockVersionedEntity()]));
        utils.mapResponses = jest.fn(() => ([mockVersionedEntity('household', { versionId: '1' })]));
        const combinedEntity = mockVersionedEntityCombined('household', { versionId: '2' });
        utils.combineEntities = jest.fn(() => ([combinedEntity]));

        const expectedRes = await myModule.actions.fetchHouseholdHistory(actionContext, household);

        expect(myModule.service.getHouseholdHistory).toHaveBeenCalledWith(household.id);
        expect(myModule.service.getHouseholdMetadataHistory).toHaveBeenCalledWith(household.id);
        expect(myModule.service.getMemberHistory).toHaveBeenCalledWith('id-1');
        expect(myModule.service.getMemberHistory).toHaveBeenCalledWith('id-2');
        expect(myModule.service.getMemberMetadataHistory).toHaveBeenCalledWith('id-1');
        expect(myModule.service.getMemberMetadataHistory).toHaveBeenCalledWith('id-2');

        expect(utils.mapResponses).toHaveBeenCalledTimes(2);
        expect(utils.combineEntities).toHaveBeenCalledWith(
[mockVersionedEntity('household', { versionId: '1' })],
          [mockVersionedEntity('household', { versionId: '1' })],
);
        expect(expectedRes).toEqual([combinedEntity]);
      });
    });
  });

  describe('mutations', () => {
    describe('setSearchResultsShown', () => {
      it('sets registration error', () => {
        store = mockStore();
        expect(store.state.household.searchResultsShown).toEqual(false);

        store.commit('household/setSearchResultsShown', true);

        expect(store.state.household.searchResultsShown).toEqual(true);
      });
    });
  });
});
