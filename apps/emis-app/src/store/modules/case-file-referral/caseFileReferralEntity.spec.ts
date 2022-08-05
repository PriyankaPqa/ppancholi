import { ActionContext } from 'vuex';
import _sortBy from 'lodash/sortBy';

import { httpClient } from '@/services/httpClient';
import { CaseFileReferralsService } from '@/services/case-file-referrals/entity';
import { OptionItemsService } from '@/services/optionItems';

import { EOptionLists, mockOptionItemData, OptionItem } from '@libs/entities-lib/optionItem';
import { mockCaseFileReferralEntity, ICaseFileReferralEntity } from '@libs/entities-lib/case-file-referral';
import { Status } from '@libs/entities-lib/base';
import { CaseFileReferralEntityModule } from './caseFileReferralEntity';
import { ICaseFileReferralEntityState } from './caseFileReferralEntity.types';
import { mockSignalR } from '../../../ui/plugins/signal-r';

const service = new CaseFileReferralsService(httpClient);
const optionItemService = new OptionItemsService(httpClient);
const signalR = mockSignalR();
let myModule: CaseFileReferralEntityModule;

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
    myModule = new CaseFileReferralEntityModule(service, optionItemService, signalR);
  });

  describe('getters', () => {
    describe('types', () => {
      test('the getter returns the sorted types', () => {
        myModule.mutations.setTypes(myModule.state, mockOptionItemData());
        const res = myModule.getters.types(myModule.state)(false);
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
        myModule.mutations.setOutcomeStatuses(myModule.state, mockOptionItemData());
        const res = myModule.getters.outcomeStatuses(myModule.state)(false);
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
        const referral1 = mockCaseFileReferralEntity({ id: '1', caseFileId: 'case-file-1' });
        const referral2 = mockCaseFileReferralEntity({ id: '2', caseFileId: 'case-file-2' });
        myModule.mutations.setAll(myModule.state, [referral1, referral2]);
        const res = myModule.getters.getByCaseFile(myModule.state)('case-file-1');
        expect(res).toEqual([referral1]);
      });
      test('the getter ignores inactive items', () => {
        const item1 = mockCaseFileReferralEntity({ id: '1', caseFileId: 'case-file-1', status: Status.Inactive });
        const item2 = mockCaseFileReferralEntity({ id: '2', caseFileId: 'case-file-1', status: Status.Active });
        myModule.mutations.setAll(myModule.state, [item1, item2]);
        const res = myModule.getters.getByCaseFile(myModule.state)('case-file-1');
        expect(res).toEqual([item2]);
      });
    });
  });

  describe('mutations', () => {
    describe('setTypes', () => {
      test('the setTypes mutation sets the state', () => {
        const items = mockOptionItemData();
        myModule.mutations.setTypes(myModule.state, items);
        expect(myModule.state.types).toEqual(items);
      });
    });

    test('the setTypesFetched mutation sets the state', () => {
      myModule.mutations.setTypesFetched(myModule.state, true);
      expect(myModule.state.typesFetched).toEqual(true);
    });

    test('the setOutcomeStatuses mutation sets the state', () => {
      const items = mockOptionItemData();
      myModule.mutations.setOutcomeStatuses(myModule.state, items);
      expect(myModule.state.outcomeStatuses).toEqual(items);
    });

    test('the setOutcomeStatusesFetched mutation sets the state', () => {
      myModule.mutations.setOutcomeStatusesFetched(myModule.state, true);
      expect(myModule.state.outcomeStatusesFetched).toEqual(true);
    });
  });

  describe('actions', () => {
    describe('fetchTypes', () => {
      it('should call optionItemService getOptionList and commit the result', async () => {
        const res = mockOptionItemData();
        myModule.optionItemService.getOptionList = jest.fn(() => Promise.resolve(res));
        await myModule.actions.fetchTypes(actionContext);

        expect(myModule.optionItemService.getOptionList).toBeCalledWith(EOptionLists.ReferralTypes);
        expect(actionContext.commit).toBeCalledWith('setTypes', res);
        expect(actionContext.commit).toBeCalledWith('setTypesFetched', true);
      });
    });

    describe('fetchOutcomeStatuses', () => {
      it('should call optionItemService getOptionList and commit the result', async () => {
        const res = mockOptionItemData();
        myModule.optionItemService.getOptionList = jest.fn(() => Promise.resolve(res));
        await myModule.actions.fetchOutcomeStatuses(actionContext);

        expect(myModule.optionItemService.getOptionList).toBeCalledWith(EOptionLists.ReferralOutcomeStatus);
        expect(actionContext.commit).toBeCalledWith('setOutcomeStatuses', res);
        expect(actionContext.commit).toBeCalledWith('setOutcomeStatusesFetched', true);
      });
    });

    describe('createReferral', () => {
      it('should call createReferral service with proper params', async () => {
        const payload = {} as ICaseFileReferralEntity;
        const res = {} as ICaseFileReferralEntity;
        myModule.service.createReferral = jest.fn(() => Promise.resolve(res));
        await myModule.actions.createReferral(actionContext, payload);

        expect(myModule.service.createReferral).toBeCalledWith(payload);
        expect(actionContext.commit).toBeCalledWith('addNewlyCreatedId', res);
        expect(actionContext.commit).toBeCalledWith('set', res);
      });
    });
  });
});
