import { createLocalVue, shallowMount } from '@/test/testSetup';
import { useMockCaseFileReferralStore } from '@/pinia/case-file-referral/case-file-referral.mock';
import routes from '@/constants/routes';
import Component from './CaseFileReferral.vue';

const localVue = createLocalVue();

const { pinia, caseFileReferralStore } = useMockCaseFileReferralStore();

describe('CaseFileReferral.vue', () => {
  let wrapper;

  const mountWrapper = (canEdit = true) => {
    wrapper = shallowMount(Component, {
      localVue,
      pinia,
      computed: {
        canEdit() {
          return canEdit;
        },
      },
      propsData: { id: 'foo' },

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
        expect(wrapper.findDataTest('case-file-referrals-table').props('items').length).toEqual(wrapper.vm.tableData.length);
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
    mountWrapper();
    test('customColumns', () => {
      expect(wrapper.vm.customColumns).toEqual({
        name: 'Entity/Name',
        refType: 'Metadata/ReferralType/Translation/en',
        outcomeStatus: 'Metadata/ReferralOutcomeStatus/Translation/en',
        edit: 'edit',
      });
    });

    describe('headers', () => {
      test('they are defined correctly', async () => {
        expect(wrapper.vm.headers).toEqual([
          {
            text: 'common.name',
            sortable: true,
            value: wrapper.vm.customColumns.name,
          },
          {
            text: 'caseFile.referral.referralType',
            value: wrapper.vm.customColumns.refType,
            sortable: true,
          },
          {
            text: 'caseFile.referral.outcomeStatus',
            value: wrapper.vm.customColumns.outcomeStatus,
            sortable: true,
          },
          {
            text: 'common.edit',
            class: 'rc-transparent-text',
            value: wrapper.vm.customColumns.edit,
            sortable: false,
          },
        ]);
      });
    });

    describe('labels', () => {
      it('should return the header object with the title received from props', async () => {
        wrapper.setProps({ title: 'caseFile.referral.title' });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.labels).toEqual({
          header: {
            title: 'caseFile.referral.title',
            searchPlaceholder: 'common.inputs.quick_search',
            addButtonLabel: 'caseFile.referral.addNewReferral',
          },
        });
      });
    });

    describe('filters', () => {
      test('they are defined correctly', async () => {
        expect(wrapper.vm.filters).toEqual([
          {
            key: wrapper.vm.customColumns.name,
            type: 'text',
            label: 'common.name',
          },
          {
            key: wrapper.vm.customColumns.refType,
            type: 'multiselect',
            label: 'caseFile.referral.referralType',
            items: wrapper.vm.referralTypes.map((t) => ({ text: wrapper.vm.$m(t.name), value: wrapper.vm.$m(t.name) })),
          },
          {
            key: 'Metadata/ReferralOutcomeStatus/Id',
            type: 'multiselect',
            keyType: 'guid',
            label: 'caseFile.referral.outcomeStatus',
            items: wrapper.vm.outcomeStatuses
              .map((s) => ({ text: wrapper.vm.$m(s.name), value: s.id }))
              .concat([{ text: '-', value: null }]),
          },
        ]);
      });
    });

    describe('tableProps', () => {
      it('returns the correct object', () => {
        expect(wrapper.vm.tableProps.loading).toEqual(false);
        expect(wrapper.vm.tableProps.itemClass).toBeDefined();
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('should call fetchTypes and fetchOutcomeStatuses', async () => {
        const spyFetchTypes = jest.spyOn(caseFileReferralStore, 'fetchTypes');
        const spyFetchOutcomeStatuses = jest.spyOn(caseFileReferralStore, 'fetchOutcomeStatuses');
        mountWrapper();
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });

        expect(spyFetchTypes).toHaveBeenCalled();
        expect(spyFetchOutcomeStatuses).toHaveBeenCalled();
      });
    });
  });

  describe('Methods', () => {
    describe('getReferralType', () => {
      it('should return the right type', () => {
        mountWrapper();
        expect(wrapper.vm.getReferralType({ type: { optionItemId: wrapper.vm.referralTypes[1].id } })).toBe(wrapper.vm.referralTypes[1].name.translation.en);
        expect(wrapper.vm.getReferralType({ })).toBe('-');
      });
    });
    describe('getOutcome', () => {
      it('should return the right type', () => {
        mountWrapper();
        expect(wrapper.vm.getOutcome({ outcomeStatus: { optionItemId: wrapper.vm.outcomeStatuses[1].id } })).toBe(wrapper.vm.outcomeStatuses[1].name.translation.en);
        expect(wrapper.vm.getOutcome({ })).toBe('-');
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

    describe('fetchData', () => {
      beforeEach(() => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: { id: 'foo' },
        });
      });

      const params = {
        filter: { 'Entity/CaseFileId': '1' },
        top: 1000,
        skip: 10,
        orderBy: 'name asc',
      };

      it('should call storage actions with proper parameters', async () => {
        jest.spyOn(caseFileReferralStore, 'search');
        await wrapper.vm.fetchData(params);
        expect(caseFileReferralStore.search).toHaveBeenCalledWith({ params: {
          filter: params.filter,
          top: params.top,
          skip: params.skip,
          orderBy: params.orderBy,
          count: true,
        },
        includeInactiveItems: false });
      });

      it('returns the search results', async () => {
        const res = await wrapper.vm.fetchData(params);
        expect(res).toBeDefined();
      });
    });
  });
});
