/**
 * @group ui/components/mass-action
 */

import { createLocalVue, shallowMount } from '@/test/testSetup';
import massActionCaseFileFiltering from './massActionCaseFileFiltering';
import { mockStorage } from '@/store/storage';
import { MassActionType } from '@/entities/mass-action';
import { EEventStatus, mockCombinedEvents } from '@/entities/event';
import helpers from '@/ui/helpers/helpers';

const storage = mockStorage();

const Component = {
  render() {},
  mixins: [massActionCaseFileFiltering],
};

const localVue = createLocalVue();
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
          $storage: storage,
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
          $storage: storage,
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
          search: 'query',
          filter: 'filter',
          top: 10,
          skip: 10,
          orderBy: 'name asc',
        };
      });

      it('should call storage actions with proper parameters if some filters are applied', async () => {
        await wrapper.setData({
          userFilters: [{ key: 'name' }],
        });

        await wrapper.vm.fetchData(params);

        expect(wrapper.vm.$storage.caseFile.actions.search)
          .toHaveBeenCalledWith({
            search: params.search,
            filter: params.filter,
            top: params.top,
            skip: params.skip,
            orderBy: params.orderBy,
            count: true,
            queryType: 'full',
            searchMode: 'all',
          });
      });
    });

    describe('fetchEventsFilter', () => {
      it('should search case file events with status onhold or open filtered by inputed name', async () => {
        await wrapper.vm.fetchEventsFilter('query');

        expect(wrapper.vm.$services.events.search)
          .toHaveBeenCalledWith({
            filter: {
              or: [
                {
                  Entity: {
                    Schedule: {
                      Status: EEventStatus.Open,
                    },
                  },
                },
                {
                  Entity: {
                    Schedule: {
                      Status: EEventStatus.OnHold,
                    },
                  },
                },
              ],
            },
            select: ['Entity/Name', 'Entity/Id'],
            top: 999,
            orderBy: 'Entity/Name/Translation/en asc',
            queryType: 'full',
            searchMode: 'all',
          });
      });

      it('should set eventsFilter the search results', async () => {
        wrapper.vm.$services.events.search = jest.fn(() => ({
          odataCount: mockCombinedEvents().length,
          odataContext: 'odataContext',
          value: mockCombinedEvents(),
        }));

        await wrapper.vm.fetchEventsFilter();

        const expected = mockCombinedEvents().map((e) => ({
          text: wrapper.vm.$m(e.entity.name),
          value: e.entity.id,
        }));

        expect(wrapper.vm.eventsFilter).toEqual(expected);
      });
    });

    describe('onExport', () => {
      it('should call exportList service with proper parameters', async () => {
        const massActionType = MassActionType.FinancialAssistance;
        await wrapper.setData({
          azureSearchParams: {
            search: 'search',
            filter: {
              Entity: { id: '1' },
            },
          },
        });

        await wrapper.vm.onExport(massActionType);

        expect(wrapper.vm.$services.massActions.exportList).toHaveBeenLastCalledWith(massActionType, {
          filter: "Entity/id eq '1'",
          search: 'search',
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
