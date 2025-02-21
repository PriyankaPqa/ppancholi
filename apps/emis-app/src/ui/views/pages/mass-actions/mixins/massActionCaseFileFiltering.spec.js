import { createLocalVue, shallowMount } from '@/test/testSetup';
import { MassActionType } from '@libs/entities-lib/mass-action';
import helpers from '@/ui/helpers/helpers';

import { mockProvider } from '@/services/provider';
import massActionCaseFileFiltering from './massActionCaseFileFiltering';

const Component = {
  render() {},
  mixins: [massActionCaseFileFiltering],
};

const localVue = createLocalVue();
const services = mockProvider();
let wrapper;

describe('massActionCaseFileFiltering.vue', () => {
  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          show: true,
        },
        mocks: {
          $services: services,
        },

      });
    });

    describe('filtersOn', () => {
      it('should return true if some filters are used', () => {
        wrapper.vm.userFilters = [{ key: 'name' }];
        expect(wrapper.vm.filtersOn).toBe(true);
      });

      it('should return false if no filters are used', () => {
        wrapper.vm.userFilters = [];
        expect(wrapper.vm.filtersOn).toBe(false);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          show: true,
        },
        mocks: {
          $services: services,
        },
      });
    });

    describe('onCancel', () => {
      it('should update show to false', () => {
        wrapper.vm.onCancel();
        expect(wrapper.emitted('update:show')[0][0]).toEqual(false);
      });
    });

    describe('onClose', () => {
      it('should update show to false', () => {
        wrapper.vm.onClose();
        expect(wrapper.emitted('update:show')[0][0]).toEqual(false);
      });
    });

    describe('fetchData', () => {
      let params;

      beforeEach(() => {
        params = {
          filter: 'filter',
          top: 10,
          skip: 10,
          orderBy: 'name asc',
        };

        wrapper.vm.combinedCaseFileStore.search = jest.fn();
      });

      it('should call storage actions with proper parameters if some filters are applied', async () => {
        await wrapper.setData({
          userFilters: [{ key: 'name' }],
        });

        await wrapper.vm.fetchData(params);

        expect(wrapper.vm.combinedCaseFileStore.search)
          .toHaveBeenCalledWith({
            filter: params.filter,
            top: params.top,
            skip: params.skip,
            orderBy: params.orderBy,
            count: true,
          }, null, false, true);
      });
    });

    describe('onExport', () => {
      it('should call exportList service with proper parameters', async () => {
        const massActionType = MassActionType.FinancialAssistance;
        await wrapper.setData({
          lastFilter: {
            filter: {
              Entity: { id: '1' },
            },
          },
        });

        await wrapper.vm.onExport(massActionType);

        expect(wrapper.vm.$services.massActions.exportList).toHaveBeenLastCalledWith(massActionType, {
          filter: "?$filter=Entity/id eq '1' and Entity/Status eq 'Active'",
          search: null,
          language: 'en',
        });
      });

      it('should call downloadFile method', async () => {
        helpers.downloadFile = jest.fn();
        wrapper.vm.$services.massActions.exportList = jest.fn(() => 'file');

        await wrapper.vm.onExport(MassActionType.FinancialAssistance);

        expect(helpers.downloadFile).toHaveBeenLastCalledWith('file');
      });
    });
  });
});
