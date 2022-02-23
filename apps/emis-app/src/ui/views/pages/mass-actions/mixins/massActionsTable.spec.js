/**
 * @group ui/components/mass-action
 */

import { createLocalVue, shallowMount } from '@/test/testSetup';
import {
  MassActionRunStatus, mockCombinedMassAction, mockCombinedMassActions, mockMassActionRun,
} from '@/entities/mass-action';
import { Status } from '@/entities/base';
import { mockStorage } from '@/store/storage';
import massActionsTable from './massActionsTable';

const Component = {
  render() {},
  mixins: [massActionsTable],
};

const localVue = createLocalVue();
const storage = mockStorage();

let wrapper;

describe('massActionsTable', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    wrapper = shallowMount(Component, {
      localVue,
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('goToDetails', () => {
      it('should return route to detail', () => {
        expect(wrapper.vm.goToDetails('1')).toEqual({
          name: wrapper.vm.detailsRouteNameData,
          params: {
            id: '1',
          },
        });
      });
    });

    describe('getLastRunEntity', () => {
      it('should return the last run of the mass action', () => {
        expect(wrapper.vm.getLastRunEntity(mockCombinedMassAction())).toEqual(mockCombinedMassAction().entity.runs[1]);
      });
    });

    describe('getLastRunMetadata', () => {
      it('should return the last run of the mass action metadata', () => {
        expect(wrapper.vm.getLastRunMetadata(mockCombinedMassAction())).toEqual(mockCombinedMassAction().metadata.runs[0]);
      });
    });

    describe('isPreprocessing', () => {
      it('should return true if the last run is pre-processing', () => {
        wrapper.vm.getLastRunEntity = jest.fn(() => mockMassActionRun({ runStatus: MassActionRunStatus.PreProcessing }));
        expect(wrapper.vm.isPreprocessing({})).toBe(true);
      });
    });

    describe('isPreprocessed', () => {
      it('should return true if the last run is pre-processed', () => {
        wrapper.vm.getLastRunEntity = jest.fn(() => mockMassActionRun({ runStatus: MassActionRunStatus.PreProcessed }));
        expect(wrapper.vm.isPreprocessed({})).toBe(true);
      });
    });

    describe('showDeleteIcon', () => {
      it('should return true if the last run is pre-processed or pre-processing', () => {
        wrapper.vm.isPreprocessing = jest.fn(() => true);
        wrapper.vm.isPreprocessed = jest.fn(() => false);
        expect(wrapper.vm.showDeleteIcon({})).toBe(true);
      });
    });

    describe('fetchData', () => {
      it('should call mass action search with proper params', async () => {
        const params = {
          search: 'query', filter: 'filter', top: 10, skip: 10, orderBy: 'name asc',
        };

        await wrapper.vm.fetchData(params);

        expect(wrapper.vm.$storage.massAction.actions.search).toHaveBeenCalledWith({
          search: params.search,
          filter: {
            ...params.filter,
            Entity: {
              Status: Status.Active,
              Type: wrapper.vm.massActionTypeData,
            },
          },
          top: params.top,
          skip: params.skip,
          orderBy: params.orderBy,
          count: true,
          queryType: 'full',
          searchMode: 'all',
        }, wrapper.vm.searchEndpointData);
      });
    });

    describe('onDelete', () => {
      it('should display confirmation dialog', async () => {
        await wrapper.vm.onDelete(mockCombinedMassAction());
        expect(wrapper.vm.$confirm).toBeCalled();
      });

      it('should trigger deactivate action with correct params', async () => {
        await wrapper.vm.onDelete(mockCombinedMassAction());
        expect(wrapper.vm.$storage.massAction.actions.deactivate).toHaveBeenCalledWith(mockCombinedMassAction().entity.id);
      });

      it('should reduce the itemCount by 1', async () => {
        wrapper.vm.itemsCount = 1;
        await wrapper.vm.onDelete(mockCombinedMassAction());
        expect(wrapper.vm.itemsCount).toEqual(0);
      });
    });
  });

  describe('Computed', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('tableData', () => {
      it('should return result of getByIds', () => {
        wrapper.vm.$storage.massAction.getters.getByIds = jest.fn(() => mockCombinedMassActions());
        expect(wrapper.vm.tableData).toEqual(mockCombinedMassActions());
      });
    });

    describe('tableProps', () => {
      it('should return correct tableProps', () => {
        expect(wrapper.vm.tableProps.loading).toEqual(wrapper.vm.$store.state.massActionEntities.searchLoading);
        expect(wrapper.vm.tableProps.itemClass).toBeDefined();
      });
    });

    describe('labels', () => {
      it('should return correct labels', () => {
        expect(wrapper.vm.labels)
          .toEqual({
            header: {
              title: `${wrapper.vm.tableTitleData} (0)`,
              searchPlaceholder: 'common.inputs.quick_search',
              addButtonLabel: '',
            },
          });
      });
    });
  });
});
