import { createLocalVue, shallowMount } from '@/test/testSetup';
import {
  MassActionDataCorrectionType, MassActionType,
  MassActionRunStatus, mockCombinedMassAction, mockCombinedMassActions, mockMassActionRun,
} from '@libs/entities-lib/mass-action';
import { useMockMassActionStore } from '@/pinia/mass-action/mass-action.mock';
import { mockServerError } from '@libs/services-lib/http-client';
import massActionsTable from './massActionsTable';

const Component = {
  render() {},
  mixins: [massActionsTable],
};

const localVue = createLocalVue();

const { pinia, massActionStore } = useMockMassActionStore();

let wrapper;

describe('massActionsTable', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    wrapper = shallowMount(Component, {
      localVue,
      pinia,
    });
    await wrapper.setData({ massActionTypeData: MassActionDataCorrectionType.DataCorrectionAuthentication });
  });

  describe('Methods', () => {
    beforeEach(async () => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,

      });
      await wrapper.setData({ massActionTypeData: MassActionDataCorrectionType.DataCorrectionAuthentication });
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

    describe('isFailedPreProcessing', () => {
      it('should return true if the last run has failed pre-processing', () => {
        wrapper.vm.getLastRunEntity = jest.fn(() => mockMassActionRun({ runStatus: MassActionRunStatus.FailedPreProcessing }));
        expect(wrapper.vm.isFailed({})).toBe(true);
      });

      it('should return true if the last run has failed processing', () => {
        wrapper.vm.getLastRunEntity = jest.fn(() => mockMassActionRun({ runStatus: MassActionRunStatus.FailedPreProcessing }));
        expect(wrapper.vm.isFailed({})).toBe(true);
      });
    });

    describe('isFailedPreProcessing', () => {
      it('should return true if the last run has failed pre-processing', () => {
        wrapper.vm.getLastRunEntity = jest.fn(() => mockMassActionRun({ runStatus: MassActionRunStatus.FailedPreProcessing }));
        expect(wrapper.vm.isFailedPreProcessing({})).toBe(true);
      });
    });

    describe('isFailedProcessing', () => {
      it('should return true if the last run has failed processing', () => {
        wrapper.vm.getLastRunEntity = jest.fn(() => mockMassActionRun({ runStatus: MassActionRunStatus.FailedProcessing }));
        expect(wrapper.vm.isFailedProcessing({})).toBe(true);
      });
    });

    describe('showDeleteIcon', () => {
      it('should return true if the last run is pre-processing', () => {
        wrapper.vm.isPreprocessing = jest.fn(() => true);
        wrapper.vm.isPreprocessed = jest.fn(() => false);
        wrapper.vm.isFailedPreProcessing = jest.fn(() => false);
        expect(wrapper.vm.showDeleteIcon({})).toBe(true);
      });

      it('should return true if the last run is pre-processed', () => {
        wrapper.vm.isPreprocessing = jest.fn(() => false);
        wrapper.vm.isPreprocessed = jest.fn(() => true);
        wrapper.vm.isFailedPreProcessing = jest.fn(() => false);
        expect(wrapper.vm.showDeleteIcon({})).toBe(true);
      });

      it('should return true if the last run is failed pre-processing', () => {
        wrapper.vm.isPreprocessing = jest.fn(() => false);
        wrapper.vm.isPreprocessed = jest.fn(() => false);
        wrapper.vm.isFailedPreProcessing = jest.fn(() => true);
        expect(wrapper.vm.showDeleteIcon({})).toBe(true);
      });

      it('should return false if none of the states return true', () => {
        wrapper.vm.isPreprocessing = jest.fn(() => false);
        wrapper.vm.isPreprocessed = jest.fn(() => false);
        wrapper.vm.isFailedPreProcessing = jest.fn(() => false);
        expect(wrapper.vm.showDeleteIcon({})).toBe(false);
      });
    });

    describe('fetchData', () => {
      it('should call mass action search with proper params', async () => {
        const params = {
          filter: { someFilter: 'filter' }, top: 10, skip: 10, orderBy: 'name asc',
        };
        wrapper.vm.combinedMassActionStore.search = jest.fn();
        await wrapper.vm.fetchData(params);

        expect(wrapper.vm.combinedMassActionStore.search).toHaveBeenCalledWith({
          filter: {
            ...params.filter,
            'Entity/Type': { in: ['DataCorrectionAuthentication'] },
          },
          top: params.top,
          skip: params.skip,
          orderBy: params.orderBy,
          count: true,
        }, null, false, true);

        await wrapper.setData({ massActionTypeData: [MassActionDataCorrectionType.DataCorrectionAuthentication, MassActionType.Assessment] });

        await wrapper.vm.fetchData(params);
        expect(wrapper.vm.combinedMassActionStore.search).toHaveBeenCalledWith({
          filter: {
            ...params.filter,
            'Entity/Type': { in: ['DataCorrectionAuthentication', 'Assessment'] },
          },
          top: params.top,
          skip: params.skip,
          orderBy: params.orderBy,
          count: true,
        }, null, false, true);
      });
    });

    describe('onDelete', () => {
      it('should display confirmation dialog', async () => {
        await wrapper.vm.onDelete(mockCombinedMassAction());
        expect(wrapper.vm.$confirm).toBeCalled();
      });

      it('should trigger deactivate action with correct params', async () => {
        await wrapper.vm.onDelete(mockCombinedMassAction());
        expect(massActionStore.deactivate).toHaveBeenCalledWith(mockCombinedMassAction().entity.id);
      });

      it('should reduce the itemCount by 1', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,

        });
        await wrapper.setData({
          itemsCount: 1,
        });
        await wrapper.vm.onDelete(mockCombinedMassAction());
        expect(wrapper.vm.itemsCount).toEqual(0);
      });

      it('should display an error toast when the call returns status 403', async () => {
        massActionStore.deactivate = jest.fn(() => Promise.reject(mockServerError([], 403)));
        await wrapper.vm.onDelete(mockCombinedMassAction());
        expect(wrapper.vm.$toasted.global.error).toBeCalledWith('massAction.processing.error.noPermission');
      });

      it('should display a report error toast when the call returns another error', async () => {
        wrapper.vm.$reportToasted = jest.fn();
        massActionStore.deactivate = jest.fn(() => Promise.reject(mockServerError([])));
        await wrapper.vm.onDelete(mockCombinedMassAction());
        expect(wrapper.vm.$reportToasted).toBeCalled();
      });
    });
  });

  describe('Computed', () => {
    beforeEach(async () => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,

      });
      await wrapper.setData({ massActionTypeData: MassActionDataCorrectionType.DataCorrectionAuthentication });
    });

    describe('tableData', () => {
      it('should return result of getByIds', () => {
        wrapper.vm.combinedMassActionStore.getByIds = jest.fn(() => mockCombinedMassActions());
        expect(wrapper.vm.tableData).toEqual(mockCombinedMassActions());
      });
    });

    describe('tableProps', () => {
      it('should return correct tableProps', () => {
        expect(wrapper.vm.tableProps.loading).toEqual(massActionStore.searchLoading);
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
