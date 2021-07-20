import * as searchEndpoints from '@/constants/searchEndpoints';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockCombinedCaseFileReferral, mockCombinedCaseFileReferrals } from '@/entities/case-file-referral';
import { mockStorage } from '@/store/storage';
import { mockOptionItemData } from '@/entities/optionItem';
import routes from '@/constants/routes';
import Component from './CaseFileReferral.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('CaseFileReferral.vue', () => {
  let wrapper;

  const mountWrapper = (canEdit = true) => {
    wrapper = shallowMount(Component, {
      localVue,
      computed: {
        canEdit() { return canEdit; },
      },
      mocks: {
        $storage: storage,
        $route: {
          params: {
            id: 'foo',
          },
        },
      },
    });
  };

  describe('Template', () => {
    describe('case-file-referrals-table', () => {
      it('should exist', async () => {
        mountWrapper();
        expect(wrapper.findDataTest('case-file-referrals-table').exists()).toBeTruthy();
      });

      it('should be bound to the items', async () => {
        mountWrapper();
        expect(wrapper.findDataTest('case-file-referrals-table').props('items').length).toEqual(mockCombinedCaseFileReferrals().length);
      });
    });

    describe('add button', () => {
      it('exists when edit = true', async () => {
        mountWrapper(true);
        expect(wrapper.findDataTest('case-file-referrals-table').props('showAddButton')).toBeTruthy();
      });
      it('doesnt exist when edit = false', async () => {
        mountWrapper(false);
        expect(wrapper.findDataTest('case-file-referrals-table').props('showAddButton')).toBeFalsy();
      });
    });
  });

  describe('Computed', () => {
    describe('caseFileReferrals', () => {
      it('calls the getByIds getter and sets the result into caseFileReferrals, extracting entity', async () => {
        const referrals = mockCombinedCaseFileReferrals();
        storage.caseFileReferral.getters.getByIds = jest.fn(() => referrals);
        mountWrapper();
        await wrapper.setData({ caseFileReferralIds: ['abcd'] });
        expect(wrapper.vm.caseFileReferrals).toEqual(referrals.map((x) => x.entity));
        expect(storage.caseFileReferral.getters.getByIds).toHaveBeenCalledWith(['abcd']);
      });
    });

    describe('refType', () => {
      it('returns optionitem from storage by id', async () => {
        const referral = mockCombinedCaseFileReferral();
        const options = mockOptionItemData();
        referral.entity.type = { optionItemId: 'myFakeId' };
        options[1].id = 'myFakeId';
        storage.caseFileReferral.getters.types = jest.fn(() => options);

        mountWrapper();
        expect(wrapper.vm.refType(referral.entity)).toEqual(options[1].name.translation.en);
      });

      it('returns empty when null', async () => {
        const referral = mockCombinedCaseFileReferral();
        const options = mockOptionItemData();
        referral.entity.type = null;
        options[1].id = 'myFakeId';
        storage.caseFileReferral.getters.types = jest.fn(() => options);

        mountWrapper();
        expect(wrapper.vm.refType(referral.entity)).toEqual('');
      });
    });

    describe('outcomeStatus', () => {
      it('returns optionitem from storage by id', async () => {
        const referral = mockCombinedCaseFileReferral();
        const options = mockOptionItemData();
        referral.entity.outcomeStatus = { optionItemId: 'myFakeId' };
        options[1].id = 'myFakeId';
        storage.caseFileReferral.getters.outcomeStatuses = jest.fn(() => options);

        mountWrapper();
        expect(wrapper.vm.outcomeStatus(referral.entity)).toEqual(options[1].name.translation.en);
      });

      it('returns empty when null', async () => {
        const referral = mockCombinedCaseFileReferral();
        const options = mockOptionItemData();
        referral.entity.outcomeStatus = null;
        options[1].id = 'myFakeId';
        storage.caseFileReferral.getters.outcomeStatuses = jest.fn(() => options);

        mountWrapper();
        expect(wrapper.vm.outcomeStatus(referral.entity)).toEqual('');
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('should call fetchTypes and fetchOutcomeStatuses', async () => {
        storage.caseFileReferral.actions.fetchTypes = jest.fn();
        storage.caseFileReferral.actions.fetchOutcomeStatuses = jest.fn();

        mountWrapper();
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(storage.caseFileReferral.actions.fetchTypes).toHaveBeenCalled();
        expect(storage.caseFileReferral.actions.fetchOutcomeStatuses).toHaveBeenCalled();
      });
    });
  });

  describe('Methods', () => {
    describe('fetchData', () => {
      it('should call storage with search and no paging', async () => {
        storage.caseFileReferral.actions.search = jest.fn(() => ({
          ids: ['zzz'],
          count: 1,
        }));
        const searchParams = {
          search: 'abcd', orderBy: 'my order by', top: 10, skip: 10,
        };

        mountWrapper();
        await wrapper.vm.fetchData(searchParams);

        expect(wrapper.vm.$storage.caseFileReferral.actions.search).toHaveBeenCalledWith({
          search: 'abcd',
          orderBy: 'my order by',
          top: null,
          skip: null,
          filter: {
            'Entity/CaseFileId': 'foo',
          },
        }, searchEndpoints.CASE_REFERRALS);
        expect(wrapper.vm.caseFileReferralIds).toEqual(['zzz']);
      });
    });

    describe('addCaseReferral', () => {
      it('should redirect to the case referral add page', async () => {
        mountWrapper();
        wrapper.vm.addCaseReferral();
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: routes.caseFile.referrals.add.name,
        });
      });
    });

    describe('getReferralDetailsRoute', () => {
      it('should redirect to the case referral details page', () => {
        mountWrapper();
        const result = wrapper.vm.getReferralDetailsRoute({ id: 'abc' });
        expect(result).toEqual({
          name: routes.caseFile.referrals.details.name,
          params: {
            referralId: 'abc',
          },
        });
      });
    });

    describe('getReferralEditRoute', () => {
      it('should redirect to the case referral edit page', () => {
        mountWrapper();
        const result = wrapper.vm.getReferralEditRoute({ id: 'abc' });
        expect(result).toEqual({
          name: routes.caseFile.referrals.edit.name,
          params: {
            referralId: 'abc',
          },
        });
      });
    });
  });
});
