/* eslint-disable */
import { ActionContext } from 'vuex';
import _sortBy from 'lodash/sortBy';

import { httpClient } from '@/services/httpClient';
import { CaseFileReferralsService } from '@/services/case-file-referrals/entity';
import { OptionItemsService } from '@/services/optionItems';

import { EOptionLists, mockOptionItemData, OptionItem } from '@/entities/optionItem';
import { mockCaseFileReferralEntity, mockCaseFileReferralEntities, ICaseFileReferralEntity } from '@/entities/case-file-referral';
import { CaseFileReferralEntityModule } from './caseFileReferralEntity';
import { ICaseFileReferralEntityState } from './caseFileReferralEntity.types';
import { Status } from '@/entities/base';

const service = new CaseFileReferralsService(httpClient);
const optionItemService = new OptionItemsService(httpClient);
let module: CaseFileReferralEntityModule;

const actionContext = {
  commit: jest.fn(),
  dispatch: jest.fn(),
  state: {} as ICaseFileReferralEntityState,
  getters: { types: jest.fn(), outcomeStatuses: jest.fn() },
  rootState: null,
  rootGetters: {},
} as ActionContext<ICaseFileReferralEntityState, ICaseFileReferralEntityState>;

describe('Case file entity module', () => {

  beforeEach(() => {
    module = new CaseFileReferralEntityModule(service, optionItemService);
  });

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

    describe('getByCaseFile', () => {
      test('the getter returns the referrals that have the id passed in the argument', () => {
        const referral1 = mockCaseFileReferralEntity({id: '1', caseFileId: 'case-file-1'});
        const referral2 = mockCaseFileReferralEntity({id: '2', caseFileId: 'case-file-2'});
        module.mutations.setAll(module.state, [referral1, referral2]);
        const res = module.getters.getByCaseFile(module.state)('case-file-1');
        expect(res).toEqual([referral1]);
      });
      test('the getter ignores inactive items', () => {
        const item1 = mockCaseFileReferralEntity({id: '1', caseFileId: 'case-file-1', status: Status.Inactive});
        const item2 = mockCaseFileReferralEntity({id: '2', caseFileId: 'case-file-1', status: Status.Active});
        module.mutations.setAll(module.state, [item1, item2]);
        const res = module.getters.getByCaseFile(module.state)('case-file-1');
        expect(res).toEqual([item2]);
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

    describe('createReferral', () => {
      it('should call createReferral service with proper params', async () => {
        const payload = {} as ICaseFileReferralEntity;
        const res = {} as ICaseFileReferralEntity;
        module.service.createReferral = jest.fn(() => Promise.resolve(res));
        await module.actions.createReferral(actionContext, payload);

        expect(module.service.createReferral).toBeCalledWith(payload);
        expect(actionContext.commit).toBeCalledWith('addNewlyCreatedId', res);
        expect(actionContext.commit).toBeCalledWith('set', res);
      });
    });

  });
});
