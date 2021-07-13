/* eslint-disable */
import { ActionContext } from 'vuex';
import _sortBy from 'lodash/sortBy';

import { httpClient } from '@/services/httpClient';
import { CaseFileReferralsService } from '@/services/case-file-referrals/entity';
import { OptionItemsService } from '@/services/optionItems';

import { EOptionLists, mockOptionItemData, OptionItem } from '@/entities/optionItem';
import { mockCaseFileReferralEntity } from '@/entities/case-file-referral';
import { CaseFileReferralEntityModule } from './caseFileReferralEntity';
import { ICaseFileReferralEntityState } from './caseFileReferralEntity.types';

const service = new CaseFileReferralsService(httpClient);
const optionItemService = new OptionItemsService(httpClient);
const module = new CaseFileReferralEntityModule(service, optionItemService);

const actionContext = {
  commit: jest.fn(),
  dispatch: jest.fn(),
  state: {} as ICaseFileReferralEntityState,
  getters: { types: jest.fn(), outcomeStatuses: jest.fn() },
  rootState: null,
  rootGetters: {},
} as ActionContext<ICaseFileReferralEntityState, ICaseFileReferralEntityState>;

describe('Case file entity module', () => {
  describe('getters', () => {
    describe('types', () => {
      test('the getter returns the sorted types', () => {
        module.mutations.setTypes(module.state, mockOptionItemData());
        const res = module.getters.types(module.state)(false);
        expect(res).toEqual(
          _sortBy(
            mockOptionItemData().map((e) => new OptionItem(e)),
            'orderRank',
          ),
        );
      });
    });

    describe('outcomeStatuses', () => {
      test('the getter returns the sorted outcomeStatuses', () => {
        module.mutations.setOutcomeStatuses(module.state, mockOptionItemData());
        const res = module.getters.outcomeStatuses(module.state)(false);
        expect(res).toEqual(
          _sortBy(
            mockOptionItemData().map((e) => new OptionItem(e)),
            'orderRank',
          ),
        );
      });
    });
  });

  describe('mutations', () => {
    describe('setTypes', () => {
      test('the setTypes mutation sets the state', () => {
        const items = mockOptionItemData();
        module.mutations.setTypes(module.state, items);
        expect(module.state.types).toEqual(items);
      });
    });

    test('the setTypesFetched mutation sets the state', () => {
      module.mutations.setTypesFetched(module.state, true);
      expect(module.state.typesFetched).toEqual(true);
    });

    test('the setOutcomeStatuses mutation sets the state', () => {
      const items = mockOptionItemData();
      module.mutations.setOutcomeStatuses(module.state, items);
      expect(module.state.outcomeStatuses).toEqual(items);
    });
    
    test('the setOutcomeStatusesFetched mutation sets the state', () => {
      module.mutations.setOutcomeStatusesFetched(module.state, true);
      expect(module.state.outcomeStatusesFetched).toEqual(true);
    });
  });

  describe('actions', () => {
    describe('fetchTypes', () => {
      it('should call optionItemService getOptionList and commit the result', async () => {
        const res = mockOptionItemData();
        module.optionItemService.getOptionList = jest.fn(() => Promise.resolve(res));
        await module.actions.fetchTypes(actionContext);

        expect(module.optionItemService.getOptionList).toBeCalledWith(EOptionLists.ReferralTypes);
        expect(actionContext.commit).toBeCalledWith('setTypes', res);
        expect(actionContext.commit).toBeCalledWith('setTypesFetched', true);
      });
    });

    describe('fetchOutcomeStatuses', () => {
      it('should call optionItemService getOptionList and commit the result', async () => {
        const res = mockOptionItemData();
        module.optionItemService.getOptionList = jest.fn(() => Promise.resolve(res));
        await module.actions.fetchOutcomeStatuses(actionContext);

        expect(module.optionItemService.getOptionList).toBeCalledWith(EOptionLists.ReferralOutcomeStatus);
        expect(actionContext.commit).toBeCalledWith('setOutcomeStatuses', res);
        expect(actionContext.commit).toBeCalledWith('setOutcomeStatusesFetched', true);
      });
    });
  });
});
