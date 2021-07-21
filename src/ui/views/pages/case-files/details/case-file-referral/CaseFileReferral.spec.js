import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockCombinedCaseFileReferral, mockCombinedCaseFileReferrals } from '@/entities/case-file-referral';
import { mockStorage } from '@/store/storage';
import { mockOptionItemData } from '@/entities/optionItem';
import routes from '@/constants/routes';
import helpers from '@/ui/helpers';
import Component from './CaseFileReferral.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const referrals = mockCombinedCaseFileReferrals();

describe('CaseFileReferral.vue', () => {
  let wrapper;
  const options = mockOptionItemData();
  storage.caseFileReferral.getters.types = jest.fn(() => options);
  storage.caseFileReferral.getters.outcomeStatuses = jest.fn(() => options);
  storage.caseFileReferral.getters.getByCaseFile = jest.fn(() => [referrals[0]]);

  const mountWrapper = (canEdit = true) => {
    const mockReferralMapped = {
      name: referrals[0].entity.name,
      id: referrals[0].entity.id,
      refType: options[0],
      outcomeStatus: options[1],
    };

    wrapper = shallowMount(Component, {
      localVue,
      computed: {
        canEdit() { return canEdit; },
        caseFileReferrals() {
          return [mockReferralMapped];
        },
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
        const test = wrapper.vm.caseFileReferrals[0];
        expect(wrapper.findDataTest('case-file-referrals-table').props('items').length).toEqual(wrapper.vm.caseFileReferrals.length);
        Object.keys(wrapper.vm.customColumns).filter((c) => c !== 'edit').forEach((c) => expect(Object.keys(test)).toContain(c));
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
    describe('caseFileReferralsMapped', () => {
      beforeEach(() => {
        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            canEdit() { return true; },
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
      });
      it('calls the getByCaseFile getter and sets the result into caseFileReferrals, extracting the properties', async () => {
        expect(storage.caseFileReferral.getters.getByCaseFile).toHaveBeenCalledWith('foo');
      });
      it('return the mapped referrals', () => {
        expect(wrapper.vm.caseFileReferralsMapped).toEqual([
          {
            name: referrals[0].entity.name,
            id: referrals[0].entity.id,
            refType: '',
            outcomeStatus: '',
          },
        ]);
      });
    });

    describe('caseFileReferrals', () => {
      it('returns the sorted and filtered referrals', () => {
        const ref1 = { name: 'z' };
        const ref2 = { name: 'a' };
        const unorderedReferrals = [ref1, ref2];

        wrapper = shallowMount(Component, {
          localVue,
          computed: {
            caseFileReferralsMapped() { return unorderedReferrals; },
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
        wrapper.vm.options = { sortBy: ['name'], sortDesc: [false] };
        expect(wrapper.vm.caseFileReferrals).toEqual([ref2, ref1]);
      });

      it('calls filterCollectionByValue if there is a filter ', () => {
        const ref1 = { name: 'z' };
        const ref2 = { name: 'a' };
        const unorderedReferrals = [ref1, ref2];
        jest.spyOn(helpers, 'filterCollectionByValue').mockImplementation(() => unorderedReferrals);

        wrapper = shallowMount(Component, {
          localVue,
          data() {
            return {
              filter: 'foo',
            };
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
        wrapper.vm.options = { sortBy: ['name'], sortDesc: [false] };
        expect(wrapper.vm.caseFileReferrals).toEqual([ref2, ref1]);
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
    describe('search', () => {
      it('sets the filter', () => {
        const searchParams = {
          search: 'abcd', orderBy: 'my order by', top: 10, skip: 10,
        };

        mountWrapper();
        wrapper.vm.search(searchParams);

        expect(wrapper.vm.filter).toEqual('abcd');
      });
    });

    describe('getRefType', () => {
      it('returns optionitem from storage by id', async () => {
        const referral = mockCombinedCaseFileReferral();
        referral.entity.type = { optionItemId: 'myFakeId' };
        mountWrapper();

        options[1].id = 'myFakeId';
        expect(wrapper.vm.getRefType(referral.entity)).toEqual(options[1].name.translation.en);
      });

      it('returns empty when null', async () => {
        const referral = mockCombinedCaseFileReferral();
        referral.entity.type = null;

        mountWrapper();
        options[1].id = 'myFakeId';
        expect(wrapper.vm.getRefType(referral.entity)).toEqual('');
      });
    });

    describe('getOutcomeStatus', () => {
      it('returns optionitem from storage by id', async () => {
        const referral = mockCombinedCaseFileReferral();
        referral.entity.outcomeStatus = { optionItemId: 'myFakeId' };

        mountWrapper();
        options[1].id = 'myFakeId';
        expect(wrapper.vm.getOutcomeStatus(referral.entity)).toEqual(options[1].name.translation.en);
      });

      it('returns empty when null', async () => {
        const referral = mockCombinedCaseFileReferral();
        referral.entity.outcomeStatus = null;
        storage.caseFileReferral.getters.outcomeStatuses = jest.fn(() => options);

        mountWrapper();
        options[1].id = 'myFakeId';
        expect(wrapper.vm.getOutcomeStatus(referral.entity)).toEqual('');
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
        jest.clearAllMocks();
        const result = wrapper.vm.getReferralDetailsRoute('abc');
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
        const result = wrapper.vm.getReferralEditRoute('abc');
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
