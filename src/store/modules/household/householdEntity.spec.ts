import { ActionContext } from 'vuex';
import { mockHttp } from '@/services/httpClient.mock';

import { HouseholdEntityModule } from '@/store/modules/household/householdEntity';
import { HouseholdsService } from '@/services/households/entity';
import { IHouseholdEntity, mockHouseholdEntity } from '@/entities/household';
import { IState } from '@/store/modules/base';
import { mockAddress } from '@/entities/value-objects/address';
import { mockVersionedEntityCombined, mockVersionedEntity } from '../../../entities/value-objects/versioned-entity/versionedEntity.mock';
import utils from '../../../entities/value-objects/versioned-entity/versionedEntityUtils';

const module = new HouseholdEntityModule(new HouseholdsService(mockHttp()));

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

    describe('fetchHouseholdHistory', () => {
      it('calls the fetchHistory service for the household and the members and calls mapResponses and combineEntities with the results', async () => {
        const household = mockHouseholdEntity();
        module.service.getHouseholdHistory = jest.fn(() => Promise.resolve([
          mockVersionedEntity('household', { entity: { members: ['id-1'] } as IHouseholdEntity }),
          mockVersionedEntity('household', { entity: { members: ['id-1', 'id-2'] } as IHouseholdEntity }),
        ]));

        module.service.getHouseholdMetadataHistory = jest.fn(() => Promise.resolve([mockVersionedEntity()]));
        module.service.getMemberHistory = jest.fn(() => Promise.resolve([mockVersionedEntity()]));
        module.service.getMemberMetadataHistory = jest.fn(() => Promise.resolve([mockVersionedEntity()]));
        utils.mapResponses = jest.fn(() => ([mockVersionedEntity('household', { versionId: '1' })]));
        const combinedEntity = mockVersionedEntityCombined('household', { versionId: '2' });
        utils.combineEntities = jest.fn(() => ([combinedEntity]));

        const expectedRes = await module.actions.fetchHouseholdHistory(actionContext, household);

        expect(module.service.getHouseholdHistory).toHaveBeenCalledWith(household.id);
        expect(module.service.getHouseholdMetadataHistory).toHaveBeenCalledWith(household.id);
        expect(module.service.getMemberHistory).toHaveBeenCalledWith('id-1');
        expect(module.service.getMemberHistory).toHaveBeenCalledWith('id-2');
        expect(module.service.getMemberMetadataHistory).toHaveBeenCalledWith('id-1');
        expect(module.service.getMemberMetadataHistory).toHaveBeenCalledWith('id-2');

        expect(utils.mapResponses).toHaveBeenCalledTimes(2);
        expect(utils.combineEntities).toHaveBeenCalledWith([mockVersionedEntity('household', { versionId: '1' })],
          [mockVersionedEntity('household', { versionId: '1' })]);
        expect(expectedRes).toEqual([combinedEntity]);
      });
    });
  });
});
