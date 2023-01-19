import { mockCaseFileReferralsService } from '@libs/services-lib/case-file-referrals/entity';
import { mockOptionItemsServiceService } from '@libs/services-lib/optionItems';
import { getBaseStoreComponents } from '@libs/stores-lib/base';
import { EOptionLists, mockOptionItemData, OptionItem } from '@libs/entities-lib/optionItem';
import { createTestingPinia } from '@pinia/testing';
import { defineStore, setActivePinia } from 'pinia';
import { ICaseFileReferralEntity, mockCaseFileReferralEntity, IdParams } from '@libs/entities-lib/case-file-referral';
import { getExtensionComponents } from '@/pinia/case-file-referral/case-file-referral-extension';
import _sortBy from 'lodash/sortBy';

import { Status } from '@libs/entities-lib/base';

const entityService = mockCaseFileReferralsService();
const optionsService = mockOptionItemsServiceService();
const baseComponents = getBaseStoreComponents<ICaseFileReferralEntity, IdParams>(entityService);

const getPinia = () => {
  const pinia = createTestingPinia({
    initialState: {
      'test-case-file-referral': {
        types: mockOptionItemData(),
        outcomeStatuses: mockOptionItemData(),
        typesFetched: false,
        outcomeStatusesFetched: false,
      },
    },
    stubActions: false,
  });
  setActivePinia(pinia);
  return pinia;
};

const useCaseFileReferralTestStore = (opts = {}) => {
  const newBaseComponents = {
    ...baseComponents,
    ...opts,
  };

  const extensionComponents = getExtensionComponents(newBaseComponents, entityService, optionsService);

  const useCaseFileReferralStore = defineStore('test-case-file-referral', () => ({
    ...newBaseComponents,
    ...extensionComponents,
  }));
  return useCaseFileReferralStore();
};

const createTestStore = (bComponents = {}) => {
  getPinia();
  return useCaseFileReferralTestStore(bComponents);
};

describe('>>> Case File Referral Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('getAllTypes', () => {
    test('the getter returns the sorted types', () => {
      const store = createTestStore();
      const res = store.getAllTypes(false);
      expect(res).toEqual(
        _sortBy(
          mockOptionItemData().map((e) => new OptionItem(e)),
          'orderRank',
        ),
      );
    });
  });

  describe('getAllOutcomeStatuses', () => {
    test('the getter returns the sorted outcomeStatuses', () => {
      const store = createTestStore();
      const res = store.getAllOutcomeStatuses(false);
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
      const store = createTestStore();
      const referral1 = mockCaseFileReferralEntity({ id: '1', caseFileId: 'case-file-1' });
      const referral2 = mockCaseFileReferralEntity({ id: '2', caseFileId: 'case-file-2' });
      store.setAll([referral1, referral2]);
      const res = store.getByCaseFile('case-file-1');
      expect(res).toEqual([referral1]);
    });
    test('the getter ignores inactive items', () => {
      const store = createTestStore();
      const item1 = mockCaseFileReferralEntity({ id: '1', caseFileId: 'case-file-1', status: Status.Inactive });
      const item2 = mockCaseFileReferralEntity({ id: '2', caseFileId: 'case-file-2', status: Status.Active });
      store.setAll([item1, item2]);
      const res = store.getByCaseFile('case-file-2');
      expect(JSON.stringify(res)).toEqual(JSON.stringify([item2]));
    });
  });

  describe('fetchTypes', () => {
    it('should call optionItemService getOptionList and commit the result', async () => {
      const store = createTestStore();
      const res = mockOptionItemData();
      optionsService.getOptionList = jest.fn(() => res);
      await store.fetchTypes();

      expect(optionsService.getOptionList).toBeCalledWith(EOptionLists.ReferralTypes);
      expect(store.types).toEqual(res);
      expect(store.typesFetched).toEqual(true);
    });
  });

  describe('fetchOutcomeStatuses', () => {
    it('should call optionItemService getOptionList and commit the result', async () => {
      const store = createTestStore();
      const res = mockOptionItemData();
      optionsService.getOptionList = jest.fn(() => res);
      await store.fetchOutcomeStatuses();

      expect(optionsService.getOptionList).toBeCalledWith(EOptionLists.ReferralOutcomeStatus);
      expect(store.outcomeStatuses).toEqual(res);
      expect(store.outcomeStatusesFetched).toEqual(true);
    });
  });

  describe('createReferral', () => {
    it('should call createReferral service with proper params', async () => {
      const bComponents = { ...baseComponents, addNewlyCreatedId: jest.fn(), set: jest.fn() };
      const store = createTestStore(bComponents);
      const payload = {} as ICaseFileReferralEntity;
      const res = {} as ICaseFileReferralEntity;
      entityService.createReferral = jest.fn(() => res);
      await store.createReferral(payload);

      expect(entityService.createReferral).toBeCalledWith(payload);
      expect(bComponents.addNewlyCreatedId).toBeCalledWith(res);
      expect(bComponents.set).toBeCalledWith(res);
    });
  });
});
