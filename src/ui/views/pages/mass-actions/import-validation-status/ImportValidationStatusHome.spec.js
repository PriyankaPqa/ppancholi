import { createLocalVue, shallowMount } from '@/test/testSetup';

import routes from '@/constants/routes';
import {
  mockMassActionRun, MassActionRunStatus, mockCombinedMassAction, mockCombinedMassActions,
} from '@/entities/mass-action';
import { mockStorage } from '@/store/storage';
import Component from './ImportValidationStatusHome.vue';

const localVue = createLocalVue();

const storage = mockStorage();

describe('ImportValidationStatusHome.vue', () => {
  let wrapper;

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('goToAdd', () => {
      it('should redirect to create page', () => {
        wrapper.vm.goToAdd();
        expect(wrapper.vm.$router.push).toHaveBeenLastCalledWith({ name: routes.massActions.importValidationStatus.create.name });
      });
    });

    describe('goToDetails', () => {
      it('should return route to detail', () => {
        expect(wrapper.vm.goToDetails('1')).toEqual({
          name: routes.massActions.importValidationStatus.details.name,
          params: {
            id: '1',
          },
        });
      });
    });

    describe('deleteItem', () => {
      it('should return false', () => {
        expect(wrapper.vm.deleteItem()).toEqual(false);
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

    describe('setResults', () => {
      it('should set itemsCount and searchResultIds', () => {
        const res = { ids: ['1'], count: 1 };
        expect(wrapper.vm.itemsCount).toEqual(0);
        expect(wrapper.vm.searchResultIds).toEqual([]);

        wrapper.vm.setResults(res);

        expect(wrapper.vm.itemsCount).toEqual(1);
        expect(wrapper.vm.searchResultIds).toEqual(['1']);
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
          filter: params.filter,
          top: params.top,
          skip: params.skip,
          orderBy: params.orderBy,
          count: true,
          queryType: 'full',
          searchMode: 'all',
        });
      });

      it('should call setResults', async () => {
        jest.spyOn(wrapper.vm, 'setResults').mockImplementation(() => {});
        const res = await wrapper.vm.fetchData({ });
        expect(wrapper.vm.setResults).toHaveBeenCalledWith(res);
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

    describe('customColumns', () => {
      it('should return correct columns', () => {
        expect(wrapper.vm.customColumns)
          .toEqual({
            name: 'Entity/Name',
            dateCreated: 'Entity/Created',
            projected: 'Metadata/LastRun/Results/Total',
            successful: 'Metadata/LastRun/Results/Successes',
            status: 'Metadata/LastRun/RunStatus',
          });
      });
    });

    describe('labels', () => {
      it('should return correct labels', () => {
        expect(wrapper.vm.labels)
          .toEqual({
            header: {
              title: 'massAction.impactValidationStatusTable.title',
              searchPlaceholder: 'common.inputs.quick_search',
            },
          });
      });
    });

    describe('headers', () => {
      it('should return correct headers', () => {
        const headers = [
          {
            text: 'massAction.common.name',
            align: 'start',
            sortable: true,
            value: wrapper.vm.customColumns.name,
            width: '50%',
          },
          {
            text: 'massAction.common.dateCreated',
            value: wrapper.vm.customColumns.dateCreated,
            sortable: true,
          }, {
            text: 'massAction.common.projected',
            value: wrapper.vm.customColumns.projected,
            sortable: true,
          }, {
            text: 'massAction.common.successful',
            value: wrapper.vm.customColumns.successful,
            sortable: true,
          }, {
            text: 'massAction.common.status',
            value: wrapper.vm.customColumns.status,
            sortable: false,
          }, {
            align: 'end',
            text: '',
            value: 'deleteButton',
            sortable: false,
          }];
        expect(wrapper.vm.headers).toEqual(headers);
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
        expect(wrapper.vm.tableProps).toEqual({
          loading: wrapper.vm.$store.state.massActionEntities.searchLoading,
        });
      });
    });
  });
});
